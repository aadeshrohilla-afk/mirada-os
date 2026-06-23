import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const STATUS_STYLES = {
  open: "bg-blue-100 text-blue-800",
  in_sampling: "bg-amber-100 text-amber-800",
  sample_approved: "bg-green-100 text-green-800",
  in_costing: "bg-indigo-100 text-indigo-800",
  cost_approved: "bg-emerald-100 text-emerald-800",
  completed: "bg-slate-200 text-slate-700",
  on_hold: "bg-orange-100 text-orange-800",
  cancelled: "bg-red-100 text-red-700",
};
const STATUS_LABELS = {
  open: "Open", in_sampling: "In Sampling", sample_approved: "Sample Approved",
  in_costing: "In Costing", cost_approved: "Cost Approved", completed: "Completed",
  on_hold: "On Hold", cancelled: "Cancelled",
};
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function QueriesPage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role, query_code_prefix").eq("id", user.id).single();
  const role = profile?.role;
  const canCreate = role === "merchandiser" || role === "admin";

  const { data: queries, error } = await supabase
    .from("mirada_queries")
    .select(`id, code, customer_name, product_type, theme, item_name, latest_item_code, latest_item_name, quantity, status,
      sample_target_date, sample_actual_date, cost_target_date, cost_actual_date,
      sampling_required, created_at,
      merchandiser:profiles!mirada_queries_merchandiser_id_fkey(full_name, email),
      designer:profiles!mirada_queries_assigned_designer_id_fkey(full_name)`)
    .order("created_at", { ascending: false }).limit(500);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Queries</h1>
          <p className="text-sm text-slate-500 mt-1">{queries?.length || 0} {(queries?.length || 0) === 1 ? "query" : "queries"} {role === "merchandiser" ? "you've raised" : role === "designer" ? "assigned to you" : "in the system"}</p>
        </div>
        {canCreate && (<Link href="/dashboard/queries/new" className="bg-mirada-purple hover:bg-mirada-purple-dark text-white px-4 py-2.5 rounded-lg font-medium transition">+ New Query</Link>)}
      </div>

      {error && (<div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">Error loading queries: {error.message}</div>)}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-3 py-3 font-medium">Code</th>
                <th className="text-left px-3 py-3 font-medium">Customer</th>
                <th className="text-left px-3 py-3 font-medium">Item / Product</th>
                <th className="text-right px-3 py-3 font-medium">Qty</th>
                <th className="text-left px-3 py-3 font-medium">Merch</th>
                <th className="text-left px-3 py-3 font-medium">Designer</th>
                <th className="text-left px-3 py-3 font-medium">Sample Tgt</th>
                <th className="text-left px-3 py-3 font-medium">Sample Act</th>
                <th className="text-left px-3 py-3 font-medium">Cost Tgt</th>
                <th className="text-left px-3 py-3 font-medium">Cost Act</th>
                <th className="text-left px-3 py-3 font-medium">Item Code</th>
                <th className="text-left px-3 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {!queries || queries.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-12 text-slate-500">
                    {canCreate ? (<>No queries yet. <Link href="/dashboard/queries/new" className="text-mirada-purple underline">Create your first query</Link>.</>) : "No queries to show."}
                  </td>
                </tr>
              ) : queries.map((q) => (
                <tr key={q.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-3 py-3 font-mono text-xs font-semibold text-mirada-purple"><Link href={`/dashboard/queries/${q.id}`}>{q.code}</Link></td>
                  <td className="px-3 py-3 text-xs">{q.customer_name}</td>
                  <td className="px-3 py-3"><div className="text-xs">{q.latest_item_name || q.item_name || "—"}</div><div className="text-[11px] text-slate-500">{q.product_type}{q.theme ? ` · ${q.theme}` : ""}</div></td>
                  <td className="px-3 py-3 text-right tabular-nums text-xs">{q.quantity}</td>
                  <td className="px-3 py-3 text-xs">{q.merchandiser?.full_name || "—"}</td>
                  <td className="px-3 py-3 text-xs">{q.designer?.full_name || <span className="text-slate-400">Unassigned</span>}</td>
                  <td className="px-3 py-3 text-xs">{q.sampling_required ? fmtDate(q.sample_target_date) : <span className="text-slate-400">N/A</span>}</td>
                  <td className="px-3 py-3 text-xs"><span className={q.sample_actual_date ? "text-green-700 font-medium" : "text-slate-400"}>{q.sample_actual_date ? fmtDate(q.sample_actual_date) : "—"}</span></td>
                  <td className="px-3 py-3 text-xs">{fmtDate(q.cost_target_date)}</td>
                  <td className="px-3 py-3 text-xs"><span className={q.cost_actual_date ? "text-green-700 font-medium" : "text-slate-400"}>{q.cost_actual_date ? fmtDate(q.cost_actual_date) : "—"}</span></td>
                  <td className="px-3 py-3 text-xs font-mono">{q.latest_item_code || "—"}</td>
                  <td className="px-3 py-3"><span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${STATUS_STYLES[q.status] || "bg-slate-100 text-slate-700"}`}>{STATUS_LABELS[q.status] || q.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
