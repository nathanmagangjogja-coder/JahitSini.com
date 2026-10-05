import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/adminApiGuard";
import { getServiceRoleOrThrow } from "@/lib/supabaseServiceRole";
import { mapDbOrderToOrder, Order } from "@/lib/orders";
import { OrderStatus } from "@/lib/data";

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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as OrderStatus | null;
    const search = searchParams.get("search");
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 200;

    const sb = await getServiceRoleOrThrow();
    let query = sb.from("orders").select("*").order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }
    if (search) {
      const searchLower = `%${search.toLowerCase()}%`;
      query = query.or(
        `order_number.ilike.${searchLower},customer_name.ilike.${searchLower},customer_phone.ilike.${searchLower},customer_email.ilike.${searchLower}`
      );
    }
    query = query.limit(Math.max(1, Math.min(limit, 1000)));

    const { data, error } = await query;

    if (error || !data) {
      console.error("GET /api/secure/admin/orders query error:", error);
      return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
    }
    const orders: Order[] = data.map(mapDbOrderToOrder);

    return NextResponse.json({ success: true, data: orders });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (isDevEnv) console.error("GET /api/secure/admin/orders:", err);
    return NextResponse.json(
      { success: false, error: isDevEnv ? message : "Internal error" },
      { status: 500 }
    );
  }
}