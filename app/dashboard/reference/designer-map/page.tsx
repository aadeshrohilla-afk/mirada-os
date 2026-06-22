import { createServerClient } from "@/lib/supabase/server";
import DesignerMapClient from "./DesignerMapClient";

export default async function DesignerMapTab() {
  const s = createServerClient();
  const [{ data: rows }, { data: customers }, { data: productTypes }, { data: licenses }, { data: designers }] = await Promise.all([
    s.from("designer_map").select("*, designer:profiles!designer_map_designer_id_fkey(full_name, email)").order("customer_name").order("priority"),
    s.from("customers").select("name").eq("active", true).order("name"),
    s.from("product_types").select("name").eq("active", true).order("name"),
    s.from("licenses").select("name").eq("active", true).order("name"),
    s.from("profiles").select("id, full_name, email").eq("role", "designer").eq("active", true).order("full_name"),
  ]);
  return <DesignerMapClient rows={rows || []} customers={customers || []} productTypes={productTypes || []} licenses={licenses || []} designers={designers || []} />;
}
