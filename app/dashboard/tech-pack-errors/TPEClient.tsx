"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { reportTPE, resolveTPE } from "./actions";

const TYPES = ["Tech Pack Missing","Incorrect Specs","Missing Artwork","Wrong Dimensions","Color Mismatch","Other"];

export default function TPEClient({ rows, queries, currentUserId, userRole }) {
  const router = useRouter();
  const [f, setF] = useState({ query_id: "", error_type: TYPES[0], description: "" });
  const [resNotes, setResNotes] = useState({});
  const [err, setErr] = useState(null);

  async function report(e){ e.preventDefault(); setErr(null); if(!f.query_id) return setErr("Select a query."); const r = await reportTPE({...f, reported_by: currentUserId}); if(r.error) return setErr(r.error); setF({query_id:"",error_type:TYPES[0],description:""}); router.refresh(); }
  async function resolve(id){ const notes = resNotes[id]||""; const r = await resolveTPE(id, notes, currentUserId); if(r.error) return alert(r.error); router.refresh(); }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Tech Pack Errors</h1>
      <p className="text-sm text-slate-500 mb-6">Designers/R&D report tech pack errors so merchandisers can fix them.</p>
      <form onSubmit={report} className="bg-white rounded-xl border border-slate-200 p-4 mb-6 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select value={f.query_id} onChange={(e)=>setF({...f, query_id: e.target.value})} className="px-3 py-2 rounded-lg border border-slate-300 text-sm"><option value="">Select query…</option>{queries.map(q=>(<option key={q.id} value={q.id}>{q.code} · {q.customer_name} · {q.item_name||"—"}</option>))}</select>
          <select value={f.error_type} onChange={(e)=>setF({...f, error_type: e.target.value})} className="px-3 py-2 rounded-lg border border-slate-300 text-sm">{TYPES.map(t=>(<option key={t}>{t}</option>))}</select>
        </div>
        <textarea placeholder="Describe the error…" value={f.description} onChange={(e)=>setF({...f, description: e.target.value})} rows={2} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
        {err && (<div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{err}</div>)}
        <button className="bg-mirada-purple text-white px-4 py-2 rounded-lg text-sm font-medium">Report Error</button>
      </form>
      <div className="space-y-3">
        {rows.length === 0 ? (<div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-500">No tech pack errors reported.</div>) : rows.map((r)=>(
          <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-sm font-semibold">{r.query?.code} · {r.error_type}</div>
                <div className="text-xs text-slate-500">{r.query?.customer_name} · {r.query?.item_name||"—"} · Reported by {r.reporter?.full_name}</div>
              </div>
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${r.resolved?"bg-green-100 text-green-700":"bg-amber-100 text-amber-700"}`}>{r.resolved?"Resolved":"Open"}</span>
            </div>
            {r.description && (<div className="text-sm text-slate-700 mb-2 whitespace-pre-wrap">{r.description}</div>)}
            {r.resolution_notes && (<div className="text-sm bg-green-50 border border-green-200 rounded-lg p-2 mt-2"><span className="text-xs text-green-700 font-medium">Resolution: </span>{r.resolution_notes}</div>)}
            {!r.resolved && (
              <div className="flex gap-2 mt-3">
                <input placeholder="Resolution notes" value={resNotes[r.id]||""} onChange={(e)=>setResNotes({...resNotes, [r.id]: e.target.value})} className="flex-1 px-3 py-1.5 rounded border border-slate-300 text-sm" />
                <button onClick={()=>resolve(r.id)} className="bg-green-600 text-white px-3 py-1.5 rounded text-sm font-medium">Resolve</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
