import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import EmbroideryClient from "./EmbroideryClient";

export default async function EmbroideryPage() {
  const s = createServerClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await s.from("profiles").select("role").eq("id", user.id).single();
  if (!["admin","embroidery_executive"].includes(profile?.role)) redirect("/dashboard");
  const { data: rows } = await s.from("mirada_embroidery_rates").select("*, executive:profiles!mirada_embroidery_rates_executive_id_fkey(full_name)").order("created_at", { ascending: false });
  return <EmbroideryClient rows={rows || []} currentUserId={user.id} userRole={profile?.role} />;
}
