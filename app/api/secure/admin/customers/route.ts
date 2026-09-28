import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/adminApiGuard";
import { getServiceRoleOrThrow } from "@/lib/supabaseServiceRole";
import { mapDbOrderToOrder, Order, sampleOrders } from "@/lib/orders";

interface CustomerSummary {
  customerPhone: string;
  customerName: string;
  email?: string;
  orderCount: number;
  activeOrderCount: number;
  lastOrderDate: string;
  latestOrderId: string;
}

function aggregateOrdersToCustomers(orders: Order[]): CustomerSummary[] {
  const byKey = new Map<string, CustomerSummary>();

  orders.forEach((order) => {
    const key = `${order.customerPhone}|${order.customerName}|${order.customerEmail ?? ""}`;
    const existing = byKey.get(key);

    if (!existing) {
      byKey.set(key, {
        customerPhone: order.customerPhone,
        customerName: order.customerName,
        email: order.customerEmail,
        orderCount: 1,
        activeOrderCount: order.status !== "done" ? 1 : 0,
        lastOrderDate: order.createdAt,
        latestOrderId: order.orderNumber,
      });
    } else {
      existing.orderCount += 1;
      if (order.status !== "done") existing.activeOrderCount += 1;
      if (new Date(order.createdAt) > new Date(existing.lastOrderDate)) {
        existing.lastOrderDate = order.createdAt;
        existing.latestOrderId = order.orderNumber;
      }
    }
  });

  return Array.from(byKey.values()).sort(
    (a, b) => new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime()
  );
}

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
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    let orders: Order[];
    if (error || !data) {
      if (isDevEnv) {
        orders = sampleOrders;
      } else {
        console.error("GET /api/secure/admin/customers query error:", error);
        return NextResponse.json(
          { success: false, error: isDevEnv ? error.message : "Internal error" },
          { status: 500 }
        );
      }
    } else {
      orders = data.map(mapDbOrderToOrder);
    }

    const customers = aggregateOrdersToCustomers(orders);

    return NextResponse.json({ success: true, data: customers });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (isDevEnv) console.error("GET /api/secure/admin/customers:", err);
    return NextResponse.json(
      { success: false, error: isDevEnv ? message : "Internal error" },
      { status: 500 }
    );
  }
}
