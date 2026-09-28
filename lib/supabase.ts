import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

function createSafeClient() {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  try {
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    console.error("lib/supabase.ts: URL/Key Supabase tidak valid, fallback ke null.", e);
    return null;
  }
}

export const supabase = createSafeClient();