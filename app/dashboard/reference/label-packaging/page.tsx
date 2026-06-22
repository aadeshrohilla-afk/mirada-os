import { createServerClient } from "@/lib/supabase/server";
import LabelPkgClient from "./LabelPkgClient";

export default async function LabelPkgTab() {
  const s = createServerClient();
  const [{ data: labels }, { data: packaging }] = await Promise.all([
    s.from("label_rates").select("*").order("label_type"),
    s.from("packaging_rates").select("*").order("packaging_type"),
  ]);
  return <LabelPkgClient labels={labels || []} packaging={packaging || []} />;
}
