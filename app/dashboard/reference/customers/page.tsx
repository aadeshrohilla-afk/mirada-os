import { createServerClient } from "@/lib/supabase/server";
import SimpleListClient from "../SimpleListClient";
import { addSimple, deleteSimple, toggleSimple } from "../actions";

export default async function CustomersTab() {
  const s = createServerClient();
  const { data: rows } = await s.from("customers").select("*").order("name");
  return <SimpleListClient rows={rows || []} label="customer" addAction={async (name) => addSimple("customers", name)} deleteAction={async (id) => deleteSimple("customers", id)} toggleAction={async (id, a) => toggleSimple("customers", id, a)} />;
}
