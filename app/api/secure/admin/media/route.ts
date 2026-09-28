import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { validateAdminSession } from "@/lib/adminApiGuard";
import { getServiceRoleOrThrow } from "@/lib/supabaseServiceRole";
import { siteImageSlots, isValidSlotKey, SITE_MEDIA_BUCKET } from "@/lib/siteImageSlots";

export const dynamic = "force-dynamic";

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB (batas body serverless ~4.5 MB)
const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

const fail = (status: number, error: string) =>
  NextResponse.json({ success: false, error }, { status });

async function guard(request: NextRequest) {
  return (await validateAdminSession(request)) ? null : fail(401, "Unauthorized");
}

function refreshPublicPages() {
  try {
    revalidatePath("/");
    revalidatePath("/hasil-jahitan");
  } catch {
    /* tidak fatal */
  }
}

/** Path objek di bucket kalau URL berasal dari bucket site-media kita, selain itu null. */
function storagePathFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${SITE_MEDIA_BUCKET}/`;
  const i = url.indexOf(marker);
  if (i === -1) return null;
  return decodeURIComponent(url.slice(i + marker.length).split("?")[0]);
}

function dbError(error: { message: string }) {
  console.error("admin/media error:", error);
  return fail(
    500,
    process.env.NODE_ENV === "development" ? error.message : "Gagal menyimpan ke database."
  );
}

/** Daftar semua slot (slot bawaan + baris tambahan di database) beserta URL saat ini. */
export async function GET(request: NextRequest) {
  const denied = await guard(request);
  if (denied) return denied;
  try {
    const sb = await getServiceRoleOrThrow();
    const { data, error } = await sb.from("site_media").select("key,url,label,category,updated_at");
    if (error) return dbError(error);

    const rows = new Map((data ?? []).map((r: any) => [r.key as string, r]));
    const known = new Set(siteImageSlots.map((s) => s.key));

    const items = siteImageSlots.map((s) => {
      const r: any = rows.get(s.key);
      return {
        key: s.key,
        label: r?.label || s.label,
        category: r?.category || s.category,
        url: r?.url ?? null,
        updatedAt: r?.updated_at ?? null,
      };
    });
    // Baris di database yang tidak ada di daftar bawaan tetap ditampilkan.
    for (const r of data ?? []) {
      if (!known.has((r as any).key)) {
        items.push({
          key: (r as any).key,
          label: (r as any).label,
          category: (r as any).category,
          url: (r as any).url,
          updatedAt: (r as any).updated_at ?? null,
        });
      }
    }
    return NextResponse.json({ success: true, items });
  } catch (e) {
    console.error("GET /api/secure/admin/media:", e);
    return fail(500, "Internal error");
  }
}

/** Upload / ganti foto satu slot. multipart/form-data: key, file */
export async function POST(request: NextRequest) {
  const denied = await guard(request);
  if (denied) return denied;
  try {
    const form = await request.formData().catch(() => null);
    if (!form) return fail(400, "Invalid request body");

    const key = form.get("key");
    const file = form.get("file");
    if (!isValidSlotKey(key)) return fail(400, "Key slot tidak valid.");
    if (!(file instanceof File)) return fail(400, "File foto wajib diisi.");

    const ext = MIME_EXT[file.type];
    if (!ext) return fail(400, "Format harus JPG, PNG, WEBP, atau AVIF.");
    if (file.size > MAX_BYTES) return fail(400, "Ukuran foto maksimal 4 MB.");

    const sb = await getServiceRoleOrThrow();

    const { data: existing } = await sb
      .from("site_media")
      .select("key,url,label,category")
      .eq("key", key)
      .maybeSingle();
    const slot = siteImageSlots.find((s) => s.key === key);
    const label = existing?.label || slot?.label || key;
    const category = existing?.category || slot?.category || "Lainnya";

    // Nama file unik tiap upload -> tidak kena cache CDN / browser.
    const path = `${key}/${Date.now()}.${ext}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error: upErr } = await sb.storage
      .from(SITE_MEDIA_BUCKET)
      .upload(path, bytes, { contentType: file.type, cacheControl: "31536000", upsert: false });
    if (upErr) {
      console.error("admin/media upload error:", upErr);
      return fail(
        500,
        /bucket/i.test(upErr.message)
          ? "Bucket 'site-media' belum ada. Jalankan migration 0007 / 0014 di Supabase."
          : "Gagal mengunggah foto ke storage."
      );
    }

    const { data: pub } = sb.storage.from(SITE_MEDIA_BUCKET).getPublicUrl(path);
    const { error: dbErr } = await sb
      .from("site_media")
      .upsert({ key, url: pub.publicUrl, label, category }, { onConflict: "key" });
    if (dbErr) {
      await sb.storage.from(SITE_MEDIA_BUCKET).remove([path]);
      return dbError(dbErr);
    }

    // Hapus file lama di bucket (kalau ada) supaya storage tidak menumpuk.
    const oldPath = storagePathFromUrl(existing?.url);
    if (oldPath) await sb.storage.from(SITE_MEDIA_BUCKET).remove([oldPath]);

    refreshPublicPages();
    return NextResponse.json({ success: true, key, url: pub.publicUrl });
  } catch (e) {
    console.error("POST /api/secure/admin/media:", e);
    return fail(500, "Internal error");
  }
}

/** Ubah label, atau pakai URL gambar eksternal (https). JSON: { key, url?, label? } */
export async function PATCH(request: NextRequest) {
  const denied = await guard(request);
  if (denied) return denied;
  try {
    const body = await request.json().catch(() => null);
    if (!body || !isValidSlotKey(body.key)) return fail(400, "Key slot tidak valid.");

    const update: Record<string, string> = {};
    if (typeof body.label === "string" && body.label.trim()) update.label = body.label.trim().slice(0, 120);
    if (typeof body.url === "string") {
      const url = body.url.trim();
      if (!/^https:\/\/[^\s]+$/i.test(url) || url.length > 2000) {
        return fail(400, "URL harus diawali https://");
      }
      update.url = url;
    }
    if (Object.keys(update).length === 0) return fail(400, "Tidak ada data yang diubah.");

    const sb = await getServiceRoleOrThrow();
    const { data: existing } = await sb
      .from("site_media")
      .select("key,url,label,category")
      .eq("key", body.key)
      .maybeSingle();
    const slot = siteImageSlots.find((s) => s.key === body.key);

    if (!existing && !update.url) return fail(400, "Slot belum punya foto. Unggah foto atau isi URL dulu.");

    const { error } = await sb.from("site_media").upsert(
      {
        key: body.key,
        url: update.url ?? existing!.url,
        label: update.label ?? existing?.label ?? slot?.label ?? body.key,
        category: existing?.category ?? slot?.category ?? "Lainnya",
      },
      { onConflict: "key" }
    );
    if (error) return dbError(error);

    if (update.url) {
      const oldPath = storagePathFromUrl(existing?.url);
      if (oldPath) await sb.storage.from(SITE_MEDIA_BUCKET).remove([oldPath]);
    }
    refreshPublicPages();
    return NextResponse.json({ success: true, key: body.key });
  } catch (e) {
    console.error("PATCH /api/secure/admin/media:", e);
    return fail(500, "Internal error");
  }
}

/** Hapus foto satu slot (baris dihapus, file di bucket ikut dihapus). JSON: { key } */
export async function DELETE(request: NextRequest) {
  const denied = await guard(request);
  if (denied) return denied;
  try {
    const body = await request.json().catch(() => null);
    if (!body || !isValidSlotKey(body.key)) return fail(400, "Key slot tidak valid.");

    const sb = await getServiceRoleOrThrow();
    const { data: existing } = await sb.from("site_media").select("url").eq("key", body.key).maybeSingle();
    const { error } = await sb.from("site_media").delete().eq("key", body.key);
    if (error) return dbError(error);

    const oldPath = storagePathFromUrl(existing?.url);
    if (oldPath) await sb.storage.from(SITE_MEDIA_BUCKET).remove([oldPath]);

    refreshPublicPages();
    return NextResponse.json({ success: true, key: body.key });
  } catch (e) {
    console.error("DELETE /api/secure/admin/media:", e);
    return fail(500, "Internal error");
  }
}
