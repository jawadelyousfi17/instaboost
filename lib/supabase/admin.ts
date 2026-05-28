import { createClient } from "@supabase/supabase-js";

// Service-role client for server-only operations like deleting users.
// NEVER import this from a Client Component or any code that ships to the browser.
let cachedAdmin: ReturnType<typeof createClient> | null = null;

export function createAdminClient() {
  if (cachedAdmin) return cachedAdmin;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY — required for account deletion.",
    );
  }

  cachedAdmin = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return cachedAdmin;
}
