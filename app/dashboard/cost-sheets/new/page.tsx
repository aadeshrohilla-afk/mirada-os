import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import CostSheetForm from "./CostSheetForm";

export default async function NewCostSheetPage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!["rd_executive","merchandiser","admin"].includes(profile?.role)) redirect("/dashboard/cost-sheets");

  const [{data: queries}, {data: settings}, {data: pcm}, {data: rawMaterials}, {data: valueAdd}, {data: labels}, {data: packaging}, {data: processRates}, {data: embroidery}] = await Promise.all([
    supabase.from("mirada_queries").select("id, code, customer_name, item_name, product_type, quantity").in("status", ["open","in_sampling","sample_approved","in_costing"]).order("created_at", {ascending: false}),
    supabase.from("mirada_settings").select("*"),
    supabase.from("mirada_pcm").select("*").order("product_type, process_name"),
    supabase.from("raw_material_rates").select("*").order("category, material"),
    supabase.from("mirada_value_add_rates").select("*").eq("active", true).order("name"),
    supabase.from("label_rates").select("*").order("label_type"),
    supabase.from("packaging_rates").select("*").order("packaging_type"),
    supabase.from("process_minute_rates").select("*").order("operation"),
    supabase.from("mirada_embroidery_rates").select("*").eq("active", true).order("created_at", {ascending: false}),
  ]);

  const sMap = (settings || []).reduce((m, s) => { m[s.key] = s.value; return m; }, {});
  return (
    <div className="max-w-6xl mx-auto">
      <Link href="/dashboard/cost-sheets" className="text-sm text-slate-600">&larr; Back</Link>
      <h1 className="text-2xl font-bold text-slate-900 mt-2 mb-1">New Cost Sheet (6-Part)</h1>
      <p className="text-sm text-slate-500 mb-6">Process â Raw Material â Value-Add â Label/Pack â OH/Profit/Royalty</p>
      <CostSheetForm
        currentUserId={user.id}
        queries={queries || []}
        defaults={{ overhead_pct: Number(sMap.default_overhead_pct || 15), profit_pct: Number(sMap.default_profit_pct || 10), royalty_pct: Number(sMap.default_royalty_pct || 0) }}
        pcm={pcm || []}
        rawMaterials={rawMaterials || []}
        valueAdd={valueAdd || []}
        labels={labels || []}
        packaging={packaging || []}
        processRates={processRates || []}
        embroidery={embroidery || []}
      />
    </div>
  );
}
