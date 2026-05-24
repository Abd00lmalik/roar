import { createClient as supabaseCreateClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseClient =
  supabaseUrl && supabaseAnonKey
    ? supabaseCreateClient(supabaseUrl, supabaseAnonKey)
    : null;

export const hasSupabaseClient = Boolean(supabaseClient);

export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null as any;
  }
  return supabaseCreateClient(supabaseUrl, supabaseAnonKey);
}
