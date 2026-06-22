import { createServerClient } from "@/lib/supabase/server";
import SimpleListClient from "../SimpleListClient";
import { addSimple, deleteSimple, toggleSimple } from "../actions";

export default async function ThemesTab() {
  const s = createServerClient();
  const { data: rows } = await s.from("themes").select("*").order("name");
  return <SimpleListClient rows={rows || []} label="theme" addAction={async (name) => addSimple("themes", name)} deleteAction={async (id) => deleteSimple("themes", id)} toggleAction={async (id, a) => toggleSimple("themes", id, a)} />;
}
