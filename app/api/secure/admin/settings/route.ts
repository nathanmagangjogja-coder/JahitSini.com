import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/adminApiGuard";
import { getServiceRoleOrThrow } from "@/lib/supabaseServiceRole";
import { BusinessSettings } from "@/lib/settings";

export async function PATCH(request: NextRequest) {
  try {
    const isAdmin = await validateAdminSession(request);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = (await request.json().catch(() => null)) as Partial<BusinessSettings> | null;
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      );
    }

    const sb = await getServiceRoleOrThrow();

    const payload: Record<string, unknown> = {};
    if (body.whatsapp !== undefined) payload.whatsapp = body.whatsapp;
    if (body.phone !== undefined) payload.phone = body.phone;
    if (body.email !== undefined) payload.email = body.email;
    if (body.address !== undefined) payload.address = body.address;
    if (body.operatingHours !== undefined) payload.operating_hours = body.operatingHours;
    if (body.mapLat !== undefined) {
      if (body.mapLat !== null && (typeof body.mapLat !== "number" || Math.abs(body.mapLat) > 90)) {
        return NextResponse.json({ success: false, error: "Latitude tidak valid (-90 s/d 90)." }, { status: 400 });
      }
      payload.map_lat = body.mapLat;
    }
    if (body.mapLng !== undefined) {
      if (body.mapLng !== null && (typeof body.mapLng !== "number" || Math.abs(body.mapLng) > 180)) {
        return NextResponse.json({ success: false, error: "Longitude tidak valid (-180 s/d 180)." }, { status: 400 });
      }
      payload.map_lng = body.mapLng;
    }
    if (body.notifyNewOrderEmail !== undefined)
      payload.notify_new_order_email = body.notifyNewOrderEmail;
    if (body.notifyUrgentWhatsapp !== undefined)
      payload.notify_urgent_whatsapp = body.notifyUrgentWhatsapp;
    if (body.notifyDailyReport !== undefined)
      payload.notify_daily_report = body.notifyDailyReport;
    if (body.photoMaxDimension !== undefined)
      payload.photo_max_dimension = body.photoMaxDimension;

    const { error } = await sb
      .from("business_settings")
      .upsert({ id: 1, ...payload }, { onConflict: "id" });

    if (error) {
      console.error("PATCH /api/secure/admin/settings upsert error:", error);
      return NextResponse.json(
        {
          success: false,
          error: process.env.NODE_ENV === "development" ? error.message : "Internal error",
        },
        { status: 500 }
      );
    }

    const { data: freshData, error: fetchErr } = await sb
      .from("business_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    let settings: BusinessSettings;
    if (fetchErr || !freshData) {
      settings = {
        whatsapp: body.whatsapp ?? "",
        phone: body.phone ?? "",
        email: body.email ?? "",
        address: body.address ?? "",
        operatingHours: body.operatingHours ?? "",
        websiteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "",
        mapLat: body.mapLat ?? null,
        mapLng: body.mapLng ?? null,
        notifyNewOrderEmail: body.notifyNewOrderEmail ?? true,
        notifyUrgentWhatsapp: body.notifyUrgentWhatsapp ?? true,
        notifyDailyReport: body.notifyDailyReport ?? false,
        photoMaxDimension: body.photoMaxDimension ?? 1600,
      };
    } else {
      settings = {
        whatsapp: freshData.whatsapp ?? "",
        phone: freshData.phone ?? "",
        email: freshData.email ?? "",
        address: freshData.address ?? "",
        operatingHours: freshData.operating_hours ?? "",
        websiteUrl: freshData.website_url ?? process.env.NEXT_PUBLIC_SITE_URL ?? "",
        mapLat: typeof freshData.map_lat === "number" ? freshData.map_lat : null,
        mapLng: typeof freshData.map_lng === "number" ? freshData.map_lng : null,
        notifyNewOrderEmail: freshData.notify_new_order_email ?? true,
        notifyUrgentWhatsapp: freshData.notify_urgent_whatsapp ?? true,
        notifyDailyReport: freshData.notify_daily_report ?? false,
        photoMaxDimension: freshData.photo_max_dimension ?? 1600,
      };
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (process.env.NODE_ENV === "development") {
      console.error("PATCH /api/secure/admin/settings:", err);
    }
    return NextResponse.json(
      {
        success: false,
        error: process.env.NODE_ENV === "development" ? message : "Internal error",
      },
      { status: 500 }
    );
  }
}