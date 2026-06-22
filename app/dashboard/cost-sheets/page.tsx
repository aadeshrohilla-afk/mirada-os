import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

const STATUS_STYLES = { draft: "bg-slate-100 text-slate-700", submitted: "bg-blue-100 text-blue-800", approved: "bg-green-100 text-green-800", rejected: "bg-red-100 text-red-700", cancelled: "bg-slate-200 text-slate-600" };

export default async function CostSheetsPage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const role = profile?.role;
  const canCreate = role === "rd_executive" || role === "admin";

  const { data: sheets } = await supabase.from("mirada_cost_sheets")
    .select(`id, target_cost, approved_cost, status, created_at, query:mirada_queries!mirada_cost_sheets_query_id_fkey(code, customer_name, item_name, product_type, quantity), prepared_by_profile:profiles!mirada_cost_sheets_prepared_by_fkey(full_name)`)
    .order("created_at", {ascending: false}).limit(500);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-slate-900">Cost Sheets</h1><p className="text-sm text-slate-500 mt-1">{sheets?.length || 0} cost sheets</p></div>
        {canCreate && (<Link href="/dashboard/cost-sheets/new" className="bg-mirada-purple hover:bg-mirada-purple-dark text-white px-4 py-2.5 rounded-lg font-medium">+ New Cost Sheet</Link>)}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-700">
              <tr><th className="text-left px-4 py-3">Query</th><th className="text-left px-4 py-3">Item</th><th className="text-left px-4 py-3">Qty</th><th className="text-left px-4 py-3">Prepared By</th><th className="text-right px-4 py-3">Target ₹</th><th className="text-right px-4 py-3">Approved ₹</th><th className="text-left px-4 py-3">Status</th><th></th></tr>
            </thead>
            <tbody>
              {!sheets || sheets.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-slate-500">No cost sheets yet.</td></tr>
              ) : sheets.map((c) => (
                <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-mirada-purple">{c.query?.code}</td>
                  <td className="px-4 py-3"><div>{c.query?.item_name || "—"}</div><div className="text-xs text-slate-500">{c.query?.customer_name} · {c.query?.product_type}</div></td>
                  <td className="px-4 py-3 text-xs">{c.query?.quantity}</td>
                  <td className="px-4 py-3 text-xs">{c.prepared_by_profile?.full_name}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{c.target_cost ?? "—"}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{c.approved_cost ?? "—"}</td>
                  <td className="px-4 py-3"><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[c.status]}`}>{c.status}</span></td>
                  <td className="px-4 py-3"><Link href={`/dashboard/cost-sheets/${c.id}`} className="text-mirada-purple text-xs underline">Open</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
