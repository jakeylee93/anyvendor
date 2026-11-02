import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { supabaseConfig } from "./env";

/** Per-request client acting as the signed-in user (RLS applies). */
export async function supabaseServer() {
  const cfg = supabaseConfig();
  if (!cfg) return null;
  const store = await cookies();
  return createServerClient(cfg.url, cfg.key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) store.set(name, value, options);
        } catch {
          // Server Components cannot set cookies; the proxy refreshes the session instead.
        }
      },
    },
  });
}

/** Service-role client. Only for the Stripe webhook, the scheduler cron and OAuth callbacks. */
export function supabaseService() {
  const cfg = supabaseConfig();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!cfg || !key) return null;
  return createClient(cfg.url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
