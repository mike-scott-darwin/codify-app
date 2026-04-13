import { createClient } from "@supabase/supabase-js";

// Service role client — bypasses RLS, use only in server-side code (webhooks, API routes)
export function createSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
