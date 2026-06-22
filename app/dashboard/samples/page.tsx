import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

const STATUS_STYLES = { planned: "bg-slate-100 text-slate-700", in_progress: "bg-amber-100 text-amber-800", review_pending: "bg-blue-100 text-blue-800", approved: "bg-green-100 text-green-800", rejected: "bg-red-100 text-red-700", cancelled: "bg-slate-200 text-slate-600" };
const STATUS_LABELS = { planned: "Planned", in_progress: "In Progress", review_pending: "Review Pending", approved: "Approved", rejected: "Rejected", cancelled: "Cancelled" };
function fmtDate(d) { return d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short"}) : "—"; }

export default async function SamplesPage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const role = profile?.role;
  const canCreate = role === "designer" || role === "admin";

  const { data: samples } = await supabase.from("mirada_samples")
    .select(`id, sample_type, dimension, status, planned_at, reviewed_at, approved_at,
      query:mirada_queries!mirada_samples_query_id_fkey(id, code, customer_name, item_name, product_type),
      designer:profiles!mirada_samples_designer_id_fkey(full_name)`)
    .order("created_at", { ascending: false }).limit(500);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Samples</h1>
          <p className="text-sm text-slate-500 mt-1">{samples?.length || 0} samples</p>
        </div>
        {canCreate && (<Link href="/dashboard/samples/new" className="bg-mirada-purple hover:bg-mirada-purple-dark text-white px-4 py-2.5 rounded-lg font-medium">+ Plan Sample</Link>)}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-700">
              <tr><th className="text-left px-4 py-3">Query</th><th className="text-left px-4 py-3">Item</th><th className="text-left px-4 py-3">Type</th><th className="text-left px-4 py-3">Designer</th><th className="text-left px-4 py-3">Planned</th><th className="text-left px-4 py-3">Approved</th><th className="text-left px-4 py-3">Status</th><th className="text-left px-4 py-3"></th></tr>
            </thead>
            <tbody>
              {!samples || samples.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-slate-500">{canCreate ? <>No samples yet. <Link href="/dashboard/samples/new" className="text-mirada-purple underline">Plan your first sample</Link>.</> : "No samples to show."}</td></tr>
              ) : samples.map((s) => (
                <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-mirada-purple">{s.query?.code}</td>
                  <td className="px-4 py-3"><div>{s.query?.item_name || "—"}</div><div className="text-xs text-slate-500">{s.query?.customer_name} · {s.query?.product_type}</div></td>
                  <td className="px-4 py-3 text-xs">{s.sample_type}</td>
                  <td className="px-4 py-3 text-xs">{s.designer?.full_name || "—"}</td>
                  <td className="px-4 py-3 text-xs">{fmtDate(s.planned_at)}</td>
                  <td className="px-4 py-3 text-xs">{fmtDate(s.approved_at)}</td>
                  <td className="px-4 py-3"><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[s.status]}`}>{STATUS_LABELS[s.status]}</span></td>
                  <td className="px-4 py-3"><Link href={`/dashboard/samples/${s.id}`} className="text-mirada-purple text-xs underline">Review</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
