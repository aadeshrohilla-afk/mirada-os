import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

export default async function AuditPage() {
  const s = createServerClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await s.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/dashboard");
  const { data: rows } = await s.from("mirada_audit_log").select(`*, actor:profiles!mirada_audit_log_actor_id_fkey(full_name)`).order("created_at", { ascending: false }).limit(500);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Audit Log</h1>
      <p className="text-sm text-slate-500 mb-6">Recent activity (last 500 events).</p>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-slate-50 text-xs uppercase"><tr><th className="text-left px-4 py-2">When</th><th className="text-left px-4 py-2">Who</th><th className="text-left px-4 py-2">Action</th><th className="text-left px-4 py-2">Entity</th><th className="text-left px-4 py-2">Detail</th></tr></thead><tbody>
          {!rows || rows.length === 0 ? (<tr><td colSpan={5} className="text-center py-10 text-slate-500">No audit entries.</td></tr>) : rows.map((r)=>(<tr key={r.id} className="border-t border-slate-100"><td className="px-4 py-2 text-xs">{new Date(r.created_at).toLocaleString("en-IN")}</td><td className="px-4 py-2 text-xs">{r.actor?.full_name || r.actor_email}</td><td className="px-4 py-2"><span className="px-2 py-0.5 rounded bg-slate-100 text-xs">{r.action}</span></td><td className="px-4 py-2 text-xs">{r.entity}{r.entity_id ? ` · ${r.entity_id.substring(0,8)}` : ""}</td><td className="px-4 py-2 text-xs text-slate-500">{r.detail ? JSON.stringify(r.detail).substring(0, 100) : ""}</td></tr>))}
        </tbody></table>
      </div>
    </div>
  );
}
