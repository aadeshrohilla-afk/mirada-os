import { createServerClient } from "@/lib/supabase/server";
import SimpleListClient from "../SimpleListClient";
import { addSimple, deleteSimple, toggleSimple } from "../actions";

export default async function ProductTypesTab() {
  const s = createServerClient();
  const { data: rows } = await s.from("product_types").select("*").order("name");
  return <SimpleListClient rows={rows || []} label="product type" addAction={async (name) => addSimple("product_types", name)} deleteAction={async (id) => deleteSimple("product_types", id)} toggleAction={async (id, a) => toggleSimple("product_types", id, a)} />;
}
