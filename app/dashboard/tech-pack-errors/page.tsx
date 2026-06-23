import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import TPEClient from "./TPEClient";

export default async function TPEPage() {
  const s = createServerClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await s.from("profiles").select("role").eq("id", user.id).single();
  const [{data: errors}, {data: queries}] = await Promise.all([
    s.from("mirada_tech_pack_errors").select(`*, query:mirada_queries!mirada_tech_pack_errors_query_id_fkey(code, customer_name, item_name), reporter:profiles!mirada_tech_pack_errors_reported_by_fkey(full_name)`).order("created_at", { ascending: false }),
    s.from("mirada_queries").select("id, code, customer_name, item_name").order("created_at", { ascending: false }),
  ]);
  return <TPEClient rows={errors || []} queries={queries || []} currentUserId={user.id} userRole={profile?.role} />;
}
