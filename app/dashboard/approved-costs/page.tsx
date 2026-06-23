import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

function fmt(d){ return d ? new Date(d).toLocaleDateString("en-IN") : "—"; }

export default async function ApprovedCostsPage() {
  const s = createServerClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) redirect("/login");

  const { data: rows } = await s.from("mirada_cost_sheets")
    .select(`id, target_cost, approved_cost, customer_approved_cost, per_piece, status, approved_at, query:mirada_queries!mirada_cost_sheets_query_id_fkey(code, customer_name, item_name, product_type, quantity)`)
    .eq("status", "approved")
    .order("approved_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Approved Cost Journey</h1>
      <p className="text-sm text-slate-500 mb-6">All cost sheets that have been approved. Delta = Approved − Target.</p>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-slate-50 text-xs uppercase"><tr><th className="text-left px-4 py-3">Query</th><th className="text-left px-4 py-3">Item</th><th className="text-right px-4 py-3">Qty</th><th className="text-right px-4 py-3">Target ₹</th><th className="text-right px-4 py-3">Approved ₹</th><th className="text-right px-4 py-3">Δ</th><th className="text-right px-4 py-3">/Piece ₹</th><th className="text-left px-4 py-3">Approved</th></tr></thead><tbody>
          {!rows || rows.length === 0 ? (<tr><td colSpan={8} className="text-center py-10 text-slate-500">No approved cost sheets yet.</td></tr>) : rows.map((r) => {
            const delta = (r.approved_cost ?? 0) - (r.target_cost ?? 0);
            return (<tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50"><td className="px-4 py-3 font-mono text-xs font-semibold text-mirada-purple"><Link href={`/dashboard/cost-sheets/${r.id}`}>{r.query?.code}</Link></td><td className="px-4 py-3"><div>{r.query?.item_name || "—"}</div><div className="text-xs text-slate-500">{r.query?.customer_name}</div></td><td className="px-4 py-3 text-right tabular-nums">{r.query?.quantity}</td><td className="px-4 py-3 text-right tabular-nums">{r.target_cost ?? "—"}</td><td className="px-4 py-3 text-right tabular-nums font-semibold">{r.approved_cost ?? "—"}</td><td className={`px-4 py-3 text-right tabular-nums ${delta>=0?"text-green-700":"text-red-700"}`}>{delta >= 0 ? "+" : ""}{delta.toFixed(2)}</td><td className="px-4 py-3 text-right tabular-nums">{r.per_piece ?? "—"}</td><td className="px-4 py-3 text-xs">{fmt(r.approved_at)}</td></tr>);
          })}
        </tbody></table>
      </div>
    </div>
  );
}
