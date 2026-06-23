import { createServerClient } from "@/lib/supabase/server";
import VAClient from "./VAClient";

export default async function VATab() {
  const s = createServerClient();
  const { data: rows } = await s.from("mirada_value_add_rates").select("*").order("name");
  return <VAClient rows={rows || []} />;
}
