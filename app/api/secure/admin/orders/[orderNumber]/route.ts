import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/adminApiGuard";
import { getServiceRoleOrThrow } from "@/lib/supabaseServiceRole";
import { mapDbOrderToOrder, Order, OrderNote, OrderPhoto, sampleOrders } from "@/lib/orders";
import { OrderStatus } from "@/lib/data";
import { buildOrderDoneMessage, sendWhatsApp, type NotifyResult } from "@/lib/whatsappNotify";

interface OrderUpdatePayload {
  status?: OrderStatus;
  price_estimate?: number;
  price_final?: number;
  difficulty?: "mudah" | "sedang" | "sulit";
  estimated_done?: string;
  notes?: string;
  photos?: OrderPhoto[];
  timeline?: {
    status: OrderStatus;
    note?: string;
    timestamp: string;
  }[];
  admin_reply_message?: string;
  /** Catatan untuk pelanggan: masuk ke timeline (kalau status berubah) dan ke chat sebagai pesan admin. */
  note?: string;
}

interface DbOrderRow {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  service_id: string;
  service_name: string;
  category: string;
  category_label: string;
  quantity: number;
  difficulty: "mudah" | "sedang" | "sulit";
  notes?: string | null;
  price_estimate?: number | null;
  price_final?: number | null;
  status: OrderStatus;
  created_at: string;
  estimated_done?: string | null;
  photos: OrderPhoto[];
  timeline: {
    status: OrderStatus;
    note?: string;
    timestamp: string;
  }[];
  customer_notes: OrderNote[];
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const isAdmin = await validateAdminSession(request);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const orderNumber = params.orderNumber;
    const body = (await request.json().catch(() => null)) as OrderUpdatePayload | null;
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      );
    }

    const sb = await getServiceRoleOrThrow();

    const { data: currentRow, error: fetchErr } = await sb
      .from("orders")
      .select("*")
      .eq("order_number", orderNumber)
      .maybeSingle();

    let current: Order | undefined;
    let isDevFallback = false;

    if (fetchErr || !currentRow) {
      if (process.env.NODE_ENV !== "production") {
        current = sampleOrders.find(
          (o) => o.orderNumber.toLowerCase() === orderNumber.toLowerCase()
        );
        if (current) isDevFallback = true;
      }
      if (!current) {
        if (process.env.NODE_ENV === "development" && fetchErr) {
          console.error("fetch order error:", fetchErr);
        }
        return NextResponse.json(
          { success: false, error: "Order tidak ditemukan" },
          { status: 404 }
        );
      }
    } else {
      current = mapDbOrderToOrder(currentRow as DbOrderRow);
    }

    const nextTimeline = current.timeline ? [...current.timeline] : [];
    const noteText = typeof body.note === "string" ? body.note.trim().slice(0, 1000) : "";
    if (body.status && body.status !== current.status) {
      nextTimeline.push({
        status: body.status,
        timestamp: new Date().toISOString(),
        ...(noteText ? { note: noteText } : {}),
      });
    }
    if (body.timeline) {
      body.timeline.forEach((entry) => {
        const exists = nextTimeline.some(
          (t) => t.timestamp === entry.timestamp && t.status === entry.status
        );
        if (!exists) nextTimeline.push(entry);
      });
    }

    const nextCustomerNotes = current.customerNotes ? [...current.customerNotes] : [];
    if (body.admin_reply_message && body.admin_reply_message.trim()) {
      nextCustomerNotes.push({
        id: `w_${Date.now()}`,
        author: "Admin Jahitsini",
        role: "admin",
        message: body.admin_reply_message.trim(),
        timestamp: new Date().toISOString(),
      });
    }

    if (noteText) {
      nextCustomerNotes.push({
        id: `w_${Date.now()}_n`,
        author: "Admin Jahitsini",
        role: "admin",
        message: noteText,
        timestamp: new Date().toISOString(),
      });
    }

    const updatedOrder: Order = {
      ...current,
      status: body.status ?? current.status,
      priceEstimate:
        body.price_estimate !== undefined ? body.price_estimate : current.priceEstimate,
      priceFinal: body.price_final !== undefined ? body.price_final : current.priceFinal,
      difficulty: body.difficulty ?? current.difficulty,
      estimatedDone:
        body.estimated_done !== undefined ? body.estimated_done : current.estimatedDone,
      notes: body.notes !== undefined ? body.notes : current.notes,
      photos: body.photos ?? current.photos,
      timeline: nextTimeline,
      customerNotes: nextCustomerNotes,
    };

    if (isDevFallback) {
      const idx = sampleOrders.findIndex((o) => o.id === current!.id);
      if (idx >= 0) sampleOrders[idx] = updatedOrder;
      return NextResponse.json({ success: true, data: updatedOrder });
    }

    const updatePayload: Record<string, unknown> = {};
    if (body.status !== undefined) updatePayload.status = body.status;
    if (body.price_estimate !== undefined) updatePayload.price_estimate = body.price_estimate;
    if (body.price_final !== undefined) updatePayload.price_final = body.price_final;
    if (body.difficulty !== undefined) updatePayload.difficulty = body.difficulty;
    if (body.estimated_done !== undefined) updatePayload.estimated_done = body.estimated_done;
    if (body.notes !== undefined) updatePayload.notes = body.notes;
    if (body.photos !== undefined) updatePayload.photos = body.photos;
    if (body.status !== undefined || body.timeline !== undefined) {
      updatePayload.timeline = nextTimeline;
    }
    if (body.admin_reply_message !== undefined || noteText) {
      updatePayload.customer_notes = nextCustomerNotes;
    }
    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ success: false, error: "Tidak ada data yang diubah" }, { status: 400 });
    }

    // .select() wajib: kalau tidak ada baris yang terupdate (mis. diblokir RLS) harus dianggap GAGAL,
    // bukan sukses palsu.
    const { data: updatedRows, error: updateErr } = await sb
      .from("orders")
      .update(updatePayload)
      .eq("order_number", orderNumber)
      .select("id");

    if (updateErr) {
      console.error("PATCH /api/secure/admin/orders/[orderNumber] update error:", updateErr);
      return NextResponse.json(
        {
          success: false,
          error:
            process.env.NODE_ENV === "development" ? updateErr.message : "Internal error",
        },
        { status: 500 }
      );
    }

    if (!updatedRows || updatedRows.length === 0) {
      console.error("PATCH orders: 0 baris terupdate. Cek SUPABASE_SERVICE_ROLE_KEY di server.");
      return NextResponse.json(
        {
          success: false,
          error: "Perubahan tidak tersimpan. Pastikan SUPABASE_SERVICE_ROLE_KEY sudah diisi di server.",
        },
        { status: 500 }
      );
    }

    // Pesanan baru saja ditandai "Selesai" -> kirim notifikasi WhatsApp otomatis ke pelanggan.
    // Kegagalan kirim WA TIDAK membatalkan perubahan status (hanya dilaporkan ke admin).
    let notify: (NotifyResult & { whatsappLink?: string }) | undefined;
    if (body.status === "done" && current.status !== "done") {
      const message = buildOrderDoneMessage({
        customerName: current.customerName,
        orderNumber: current.orderNumber,
        serviceName: current.serviceName,
      });
      notify = await sendWhatsApp(current.customerPhone, message);
      if (!notify.sent) {
        const digits = current.customerPhone.replace(/[^0-9]/g, "").replace(/^0/, "62");
        notify.whatsappLink = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
      }
    }

    return NextResponse.json({ success: true, data: updatedOrder, notify });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (process.env.NODE_ENV === "development") {
      console.error("PATCH /api/secure/admin/orders/[orderNumber]:", err);
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