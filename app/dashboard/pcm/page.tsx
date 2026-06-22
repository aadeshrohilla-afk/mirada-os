import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import PCMClient from "./PCMClient";

export default async function PCMPage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const { data: rows } = await supabase.from("mirada_pcm").select("*").order("product_type").order("process_name");
  const { data: productTypes } = await supabase.from("product_types").select("id, name").eq("active", true).order("name");

  return <PCMClient rows={rows || []} productTypes={productTypes || []} userRole={profile?.role} />;
}
