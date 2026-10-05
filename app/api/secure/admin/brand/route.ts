import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { validateAdminSession } from "@/lib/adminApiGuard";
import { getServiceRoleOrThrow } from "@/lib/supabaseServiceRole";

const BUCKET = "brand-assets";

type Kind = "logo" | "favicon";
type ServiceClient = Awaited<ReturnType<typeof getServiceRoleOrThrow>>;

const RULES: Record<Kind, { maxBytes: number; exts: string[]; column: string }> = {
  logo: { maxBytes: 200 * 1024, exts: ["svg", "png"], column: "logo_url" },
  favicon: { maxBytes: 100 * 1024, exts: ["ico", "png"], column: "favicon_url" },
};

const MIME: Record<string, string> = {
  svg: "image/svg+xml",
  png: "image/png",
  ico: "image/x-icon",
};

function isKind(v: unknown): v is Kind {
  return v === "logo" || v === "favicon";
}

/** Cek isi file (bukan cuma ekstensi) supaya file lain tidak bisa menyamar jadi gambar. */
function sniffOk(buf: Buffer, ext: string): boolean {
  if (ext === "png") {
    return (
      buf.length > 8 &&
      buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    );
  }
  if (ext === "ico") {
    return buf.length > 4 && buf[0] === 0 && buf[1] === 0 && buf[2] === 1 && buf[3] === 0;
  }
  if (ext === "svg") {
    const text = buf.toString("utf8");
    if (!/<svg[\s>]/i.test(text)) return false;
    // SVG tidak boleh membawa skrip / event handler / tautan javascript.
    if (/<script|\son\w+\s*=|javascript:|<foreignObject/i.test(text)) return false;
    return true;
  }
  return false;
}

function pathFromPublicUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const marker = `/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx < 0) return null;
  return decodeURIComponent(url.slice(idx + marker.length).split("?")[0]);
}

async function saveUrl(sb: ServiceClient, column: string, value: string | null) {
  const { data: rows, error } = await sb
    .from("business_settings")
    .update({ [column]: value })
    .eq("id", 1)
    .select("id");
  if (error) throw error;
  if (!rows || rows.length === 0) {
    const { error: insErr } = await sb.from("business_settings").insert({ id: 1, [column]: value });
    if (insErr) throw insErr;
  }
}

async function readCurrentUrl(sb: ServiceClient, column: string): Promise<string | null> {
  const { data } = await sb.from("business_settings").select(column).eq("id", 1).maybeSingle();
  return (data as Record<string, string | null> | null)?.[column] ?? null;
}

export async function POST(request: NextRequest) {
  try {
    if (!(await validateAdminSession(request))) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const form = await request.formData().catch(() => null);
    const kind = form?.get("kind");
    const file = form?.get("file");
    if (!form || !isKind(kind) || !(file instanceof File)) {
      return NextResponse.json({ success: false, error: "Data upload tidak valid" }, { status: 400 });
    }

    const rule = RULES[kind];
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if (!rule.exts.includes(ext)) {
      return NextResponse.json(
        { success: false, error: `Format harus ${rule.exts.map((e) => e.toUpperCase()).join(" atau ")}` },
        { status: 400 }
      );
    }
    if (file.size === 0 || file.size > rule.maxBytes) {
      return NextResponse.json(
        { success: false, error: `Ukuran file maksimal ${Math.round(rule.maxBytes / 1024)} KB` },
        { status: 400 }
      );
    }

    const buf = Buffer.from(await file.arrayBuffer());
    if (!sniffOk(buf, ext)) {
      return NextResponse.json({ success: false, error: "Isi file bukan gambar yang valid" }, { status: 400 });
    }

    const sb = await getServiceRoleOrThrow();
    const oldUrl = await readCurrentUrl(sb, rule.column);

    const path = `${kind}/${Date.now()}.${ext}`;
    const { error: upErr } = await sb.storage.from(BUCKET).upload(path, buf, {
      contentType: MIME[ext],
      cacheControl: "31536000",
      upsert: false,
    });
    if (upErr) {
      console.error("POST /api/secure/admin/brand upload error:", upErr);
      return NextResponse.json(
        {
          success: false,
          error:
            process.env.NODE_ENV === "development"
              ? upErr.message
              : "Gagal mengunggah. Pastikan bucket brand-assets sudah dibuat (jalankan SQL 0011).",
        },
        { status: 500 }
      );
    }

    const { data: pub } = sb.storage.from(BUCKET).getPublicUrl(path);
    const url = pub.publicUrl;

    await saveUrl(sb, rule.column, url);

    // Hapus file lama (best effort) supaya storage tidak menumpuk.
    const oldPath = pathFromPublicUrl(oldUrl);
    if (oldPath) await sb.storage.from(BUCKET).remove([oldPath]).catch(() => {});

    revalidatePath("/", "layout");
    return NextResponse.json({ success: true, url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("POST /api/secure/admin/brand:", err);
    return NextResponse.json(
      { success: false, error: process.env.NODE_ENV === "development" ? message : "Internal error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!(await validateAdminSession(request))) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const kind = request.nextUrl.searchParams.get("kind");
    if (!isKind(kind)) {
      return NextResponse.json({ success: false, error: "Jenis file tidak valid" }, { status: 400 });
    }
    const rule = RULES[kind];
    const sb = await getServiceRoleOrThrow();
    const oldUrl = await readCurrentUrl(sb, rule.column);

    await saveUrl(sb, rule.column, null);

    const oldPath = pathFromPublicUrl(oldUrl);
    if (oldPath) await sb.storage.from(BUCKET).remove([oldPath]).catch(() => {});

    revalidatePath("/", "layout");
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("DELETE /api/secure/admin/brand:", err);
    return NextResponse.json(
      { success: false, error: process.env.NODE_ENV === "development" ? message : "Internal error" },
      { status: 500 }
    );
  }
}