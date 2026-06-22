import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import CostSheetForm from "./CostSheetForm";

export default async function NewCostSheetPage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!["rd_executive","admin"].includes(profile?.role)) redirect("/dashboard/cost-sheets");

  const { data: queries } = await supabase.from("mirada_queries")
    .select("id, code, customer_name, item_name, product_type, quantity")
    .in("status", ["open","in_sampling","sample_approved","in_costing"])
    .order("created_at", {ascending: false});

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/dashboard/cost-sheets" className="text-sm text-slate-600">&larr; Back</Link>
      <h1 className="text-2xl font-bold text-slate-900 mt-2 mb-6">New Cost Sheet</h1>
      <CostSheetForm currentUserId={user.id} queries={queries || []} />
    </div>
  );
}
