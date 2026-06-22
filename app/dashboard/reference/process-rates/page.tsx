import { createServerClient } from "@/lib/supabase/server";
import ProcessRatesClient from "./ProcessRatesClient";

export default async function ProcessRatesTab() {
  const s = createServerClient();
  const { data: rows } = await s.from("process_minute_rates").select("*").order("operation");
  return <ProcessRatesClient rows={rows || []} />;
}
