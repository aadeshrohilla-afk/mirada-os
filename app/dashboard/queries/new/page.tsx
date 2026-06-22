import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import QueryForm from "./QueryForm";

export default async function NewQueryPage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role, full_name, query_code_prefix").eq("id", user.id).single();
  const role = profile?.role;
  if (role !== "merchandiser" && role !== "admin") redirect("/dashboard/queries");

  // Load reference data + designer list
  const [customersRes, productTypesRes, themesRes, designersRes, merchsRes] = await Promise.all([
    supabase.from("customers").select("id, name").eq("active", true).order("name"),
    supabase.from("product_types").select("id, name").eq("active", true).order("name"),
    supabase.from("themes").select("id, name").eq("active", true).order("name"),
    supabase.from("profiles").select("id, full_name, email").eq("role", "designer").eq("active", true).order("full_name"),
    supabase.from("profiles").select("id, full_name, email, query_code_prefix").eq("role", "merchandiser").eq("active", true).order("full_name"),
  ]);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard/queries" className="text-sm text-slate-600 hover:text-mirada-purple">&larr; Back to queries</Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">New Query</h1>
        <p className="text-sm text-slate-500 mt-1">Create a customer query. A query code will be generated automatically.</p>
      </div>
      <QueryForm
        currentUserId={user.id}
        currentUserRole={role}
        currentUserPrefix={profile?.query_code_prefix || ""}
        customers={customersRes.data || []}
        productTypes={productTypesRes.data || []}
        themes={themesRes.data || []}
        designers={designersRes.data || []}
        merchandisers={merchsRes.data || []}
      />
    </div>
  );
}
