import { createServerClient } from "@/lib/supabase/server";
import SimpleListClient from "../SimpleListClient";
export default async function ThemesTab() {
  const s = createServerClient();
  const { data: rows } = await s.from("themes").select("*").order("name");
  return <SimpleListClient rows={rows || []} label="theme" table="themes" />;
}
