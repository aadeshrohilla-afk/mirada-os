import { createServerClient } from "@/lib/supabase/server";
import SimpleListClient from "../SimpleListClient";
export default async function ProductTypesTab() {
  const s = createServerClient();
  const { data: rows } = await s.from("product_types").select("*").order("name");
  return <SimpleListClient rows={rows || []} label="product type" table="product_types" />;
}
