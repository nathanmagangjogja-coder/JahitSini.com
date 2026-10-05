import { supabase } from "./supabase";

export interface ContactMessageInput {
  name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
}

export interface ContactMessage extends ContactMessageInput {
  id: string;
  isRead: boolean;
  createdAt: string;
}

const LOCAL_CONTACT_MESSAGES_KEY = "jahitsini_contact_messages";
const LOCAL_CONTACT_MESSAGES_EVENT = "jahitsini:contact-messages-changed";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readLocalMessages(): ContactMessage[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_CONTACT_MESSAGES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalMessages(messages: ContactMessage[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(LOCAL_CONTACT_MESSAGES_KEY, JSON.stringify(messages));
  window.dispatchEvent(new CustomEvent(LOCAL_CONTACT_MESSAGES_EVENT));
}

function saveLocalMessage(input: ContactMessageInput): boolean {
  const message: ContactMessage = {
    ...input,
    id: `local_msg_${Date.now()}`,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  writeLocalMessages([message, ...readLocalMessages()]);
  return true;
}

/** Kirim pesan kontak ke Supabase, atau simpan lokal kalau database belum siap. */
export async function sendContactMessage(input: ContactMessageInput): Promise<boolean> {
  if (!supabase) return saveLocalMessage(input);
  const { error } = await supabase.from("contact_messages").insert({
    name: input.name,
    phone: input.phone,
    email: input.email || null,
    subject: input.subject,
    message: input.message,
  });
  if (error) return saveLocalMessage(input);
  return true;
}

export function mapDbMessage(row: any): ContactMessage {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email ?? undefined,
    subject: row.subject,
    message: row.message,
    isRead: row.is_read,
    createdAt: row.created_at,
  };
}

/**
 * Fungsi ADMIN: lewat /api/secure/admin/messages, yang berjalan di server
 * dengan service role + verifikasi sesi admin. Dipakai di halaman /admin/messages,
 * karena browser (anon key) tidak diizinkan RLS membaca tabel contact_messages.
 */
export async function getAllContactMessagesAdmin(): Promise<ContactMessage[]> {
  try {
    const res = await fetch("/api/secure/admin/messages", { cache: "no-store" });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) return [];
    return (json.data || []) as ContactMessage[];
  } catch {
    return [];
  }
}

export async function markContactMessageReadAdmin(messageId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/secure/admin/messages/${encodeURIComponent(messageId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_read: true }),
    });
    const json = await res.json().catch(() => null);
    return res.ok && !!json?.success;
  } catch {
    return false;
  }
}