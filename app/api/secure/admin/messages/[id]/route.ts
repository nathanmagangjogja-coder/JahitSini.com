import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/adminApiGuard";
import { getServiceRoleOrThrow } from "@/lib/supabaseServiceRole";

interface MarkReadBody {
  is_read: boolean;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAdmin = await validateAdminSession(request);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const messageId = params.id;
    const body = (await request.json().catch(() => null)) as MarkReadBody | null;
    if (!body || typeof body.is_read !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Invalid request body: is_read boolean diperlukan" },
        { status: 400 }
      );
    }

    const sb = await getServiceRoleOrThrow();

    if (process.env.NODE_ENV !== "production" && messageId.startsWith("msg_dev_")) {
      return NextResponse.json({ success: true });
    }

    const { error } = await sb
      .from("contact_messages")
      .update({ is_read: body.is_read })
      .eq("id", messageId);

    if (error) {
      console.error("PATCH /api/secure/admin/messages/[id] update error:", error);
      return NextResponse.json(
        {
          success: false,
          error: process.env.NODE_ENV === "development" ? error.message : "Internal error",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (process.env.NODE_ENV === "development") {
      console.error("PATCH /api/secure/admin/messages/[id]:", err);
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
