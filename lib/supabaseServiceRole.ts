import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "./supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

let cachedServiceRoleClient: SupabaseClient | null = null;

export function supabaseServiceRole(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseServiceRoleKey) return null;
  if (cachedServiceRoleClient) return cachedServiceRoleClient;
  try {
    cachedServiceRoleClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
    return cachedServiceRoleClient;
  } catch (e) {
    console.error("lib/supabaseServiceRole.ts: Gagal membuat service role client.", e);
    return null;
  }
}

export async function getServiceRoleOrThrow(): Promise<SupabaseClient> {
  const client = supabaseServiceRole();
  if (client) return client;

  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "lib/supabaseServiceRole.ts: SUPABASE_SERVICE_ROLE_KEY tidak tersedia. Fallback ke supabase() anon client untuk development."
    );
    if (supabase) return supabase as SupabaseClient;
  }

  throw new Error("Supabase service role client tidak tersedia.");
}
