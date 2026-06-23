import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import DRClient from "./DRClient";

export default async function DRPage() {
  const s = createServerClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) redirect("/login");
  const [{data: rows}, {data: queries}] = await Promise.all([
    s.from("mirada_designer_requests").select(`*, query:mirada_queries!mirada_designer_requests_query_id_fkey(code, customer_name, item_name), designer:profiles!mirada_designer_requests_designer_id_fkey(full_name)`).order("created_at", { ascending: false }),
    s.from("mirada_queries").select("id, code, customer_name, item_name").order("created_at", { ascending: false }),
  ]);
  return <DRClient rows={rows || []} queries={queries || []} currentUserId={user.id} />;
}
