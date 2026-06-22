import { createServerClient } from "@/lib/supabase/server";
import LicensesClient from "./LicensesClient";

export default async function LicensesTab() {
  const s = createServerClient();
  const [{ data: licenses }, { data: royalty }] = await Promise.all([
    s.from("licenses").select("*").order("name"),
    s.from("royalty_rates").select("*").order("license_name"),
  ]);
  return <LicensesClient licenses={licenses || []} royalty={royalty || []} />;
}
