import { createClient } from "@supabase/supabase-js";

/**
 * Admin Supabase client using the service role key.
 * Use ONLY in server-side code for admin operations (create users, list users, etc).
 * Bypasses RLS - never expose this client to the browser.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
