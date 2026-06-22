import { createServerClient } from "@/lib/supabase/server";
import RawMaterialsClient from "./RawMaterialsClient";

export default async function RawMaterialsTab() {
  const s = createServerClient();
  const { data: rows } = await s.from("raw_material_rates").select("*").order("category").order("material");
  return <RawMaterialsClient rows={rows || []} />;
}
