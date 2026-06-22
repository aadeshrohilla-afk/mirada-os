import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import EditQueryForm from "./EditQueryForm";

export default async function QueryDetail({ params }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  const { data: q } = await supabase.from("mirada_queries").select("*").eq("id", params.id).single();
  if (!q) notFound();
  const canEdit = profile?.role === "admin" || q.merchandiser_id === user.id;

  const [customersRes, productTypesRes, themesRes, designersRes] = await Promise.all([
    supabase.from("customers").select("id, name").eq("active", true).order("name"),
    supabase.from("product_types").select("id, name").eq("active", true).order("name"),
    supabase.from("themes").select("id, name").eq("active", true).order("name"),
    supabase.from("profiles").select("id, full_name, email").eq("role", "designer").eq("active", true).order("full_name"),
  ]);

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/dashboard/queries" className="text-sm text-slate-600">&larr; Back</Link>
      <h1 className="text-2xl font-bold text-slate-900 mt-2 mb-1">{q.code}</h1>
      <p className="text-sm text-slate-500 mb-6">Status: <span className="font-medium">{q.status}</span></p>
      <EditQueryForm query={q} canEdit={canEdit} isAdmin={profile?.role === "admin"} customers={customersRes.data || []} productTypes={productTypesRes.data || []} themes={themesRes.data || []} designers={designersRes.data || []} />
    </div>
  );
}
