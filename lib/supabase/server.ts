import { createServerClient as createSSRClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createServerClient() {
  const cookieStore = cookies();
  return createSSRClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value; },
        set(name, value, options) { try { cookieStore.set({ name, value, ...options }); } catch {} },
        remove(name, options) { try { cookieStore.set({ name, value: "", ...options }); } catch {} },
      },
    }
  );
}
