import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import CostSheetActions from "./CostSheetActions";

export default async function CostSheetDetail({ params }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  const { data: cs } = await supabase.from("mirada_cost_sheets")
    .select(`*, query:mirada_queries!mirada_cost_sheets_query_id_fkey(*), prepared_by_profile:profiles!mirada_cost_sheets_prepared_by_fkey(full_name)`)
    .eq("id", params.id).single();
  if (!cs) notFound();

  const canAct = ["admin","rd_executive","merchandiser"].includes(profile?.role);

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/dashboard/cost-sheets" className="text-sm text-slate-600">&larr; Back</Link>
      <div className="flex items-center justify-between mt-2 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cost Sheet · <span className="font-mono text-mirada-purple">{cs.query?.code}</span></h1>
          <p className="text-sm text-slate-500 mt-1">{cs.query?.customer_name} · {cs.query?.item_name || cs.query?.product_type} · {cs.query?.quantity} units</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100">{cs.status}</span>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div><div className="text-xs text-slate-500">Rate/min</div><div className="tabular-nums">₹{cs.rate_per_min}</div></div>
          <div><div className="text-xs text-slate-500">Total Min (SAMs)</div><div className="tabular-nums">{cs.total_minutes}</div></div>
          <div><div className="text-xs text-slate-500">Process Cost</div><div className="tabular-nums">₹{cs.process_cost}</div></div>
          <div><div className="text-xs text-slate-500">Material</div><div className="tabular-nums">₹{cs.material_cost}</div></div>
          <div><div className="text-xs text-slate-500">Embroidery</div><div className="tabular-nums">₹{cs.embroidery_cost}</div></div>
          <div><div className="text-xs text-slate-500">Packaging</div><div className="tabular-nums">₹{cs.packaging_cost}</div></div>
          <div><div className="text-xs text-slate-500">Overhead %</div><div>{cs.overhead_pct}%</div></div>
          <div><div className="text-xs text-slate-500">Royalty %</div><div>{cs.royalty_pct}%</div></div>
          <div><div className="text-xs text-slate-500">Profit %</div><div>{cs.profit_pct}%</div></div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-100">
          <div><div className="text-xs text-slate-500">Target Cost</div><div className="text-2xl font-bold text-mirada-purple tabular-nums">₹{cs.target_cost}</div></div>
          <div><div className="text-xs text-slate-500">Approved Cost</div><div className="text-2xl font-bold tabular-nums">{cs.approved_cost ? `₹${cs.approved_cost}` : "—"}</div></div>
        </div>
        {cs.notes && (<div className="mt-4 pt-4 border-t border-slate-100"><div className="text-xs text-slate-500">Notes</div><div className="text-sm whitespace-pre-wrap">{cs.notes}</div></div>)}
      </div>
      {canAct && cs.status !== "approved" && cs.status !== "cancelled" && (
        <CostSheetActions sheetId={cs.id} currentStatus={cs.status} targetCost={cs.target_cost} userRole={profile?.role} />
      )}
    </div>
  );
}
