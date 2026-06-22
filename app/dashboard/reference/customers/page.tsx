import { createServerClient } from "@/lib/supabase/server";
import SimpleListClient from "../SimpleListClient";
export default async function CustomersTab() {
  const s = createServerClient();
  const { data: rows } = await s.from("customers").select("*").order("name");
  return <SimpleListClient rows={rows || []} label="customer" table="customers" />;
}
