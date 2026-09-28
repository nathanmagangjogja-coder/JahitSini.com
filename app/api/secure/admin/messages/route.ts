import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/adminApiGuard";
import { getServiceRoleOrThrow } from "@/lib/supabaseServiceRole";
import { ContactMessage, mapDbMessage } from "@/lib/contact";

const devMessages: ContactMessage[] = [
  {
    id: "msg_dev_1",
    name: "Budi Santoso",
    phone: "089876543210",
    email: "budi@example.com",
    subject: "Tanya permak jas",
    message: "Apakah bisa permak jas untuk acara pernikahan? Saya butuh selesai dalam 3 hari.",
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "msg_dev_2",
    name: "Siti Aisyah",
    phone: "081234567890",
    subject: "Jam operasional",
    message: "Selamat siang, apakah hari Sabtu buka? Saya ingin datang langsung ke workshop.",
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

export async function GET(request: NextRequest) {
  const isDevEnv = (process.env.NODE_ENV as string) === "development";
  try {
    const isAdmin = await validateAdminSession(request);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const sb = await getServiceRoleOrThrow();
    const { data, error } = await sb
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    let messages: ContactMessage[];
    if (error || !data) {
      if (isDevEnv) {
        messages = devMessages;
      } else {
        console.error("GET /api/secure/admin/messages query error:", error);
        return NextResponse.json(
          { success: false, error: isDevEnv ? error.message : "Internal error" },
          { status: 500 }
        );
      }
    } else {
      messages = data.map(mapDbMessage);
    }

    return NextResponse.json({ success: true, data: messages });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (isDevEnv) console.error("GET /api/secure/admin/messages:", err);
    return NextResponse.json(
      { success: false, error: isDevEnv ? message : "Internal error" },
      { status: 500 }
    );
  }
}
