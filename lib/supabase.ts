import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

export const hasSupabase = !!(supabaseUrl && supabaseAnonKey);

if (typeof window !== "undefined") {
  console.log("ScalePay Database Connection Status:", {
    hasSupabase,
    hasUrl: !!supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
  });
}

export const supabase = hasSupabase
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;
