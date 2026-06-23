"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createDR, resolveDR } from "./actions";

const TYPES = ["Tech Pack Required","Reference Sample Required","Color Approval","Material Sample","Artwork Approval","Other"];

export default function DRClient({ rows, queries, currentUserId }) {
  const router = useRouter();
  const [f, setF] = useState({ query_id: "", request_type: TYPES[0], description: "" });
  const [resNotes, setResNotes] = useState({});
  const [err, setErr] = useState(null);

  async function create(e){ e.preventDefault(); setErr(null); const r = await createDR({...f, designer_id: currentUserId}); if(r.error) return setErr(r.error); setF({query_id:"",request_type:TYPES[0],description:""}); router.refresh(); }
  async function resolve(id){ const notes = resNotes[id]||""; const r = await resolveDR(id, notes); if(r.error) return alert(r.error); router.refresh(); }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Designer Requests</h1>
      <p className="text-sm text-slate-500 mb-6">Designers raise requests (tech pack, reference samples, approvals) for merchandisers/R&D to action.</p>
      <form onSubmit={create} className="bg-white rounded-xl border border-slate-200 p-4 mb-6 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select value={f.query_id} onChange={(e)=>setF({...f, query_id: e.target.value})} className="px-3 py-2 rounded-lg border border-slate-300 text-sm"><option value="">Select query (optional)…</option>{queries.map(q=>(<option key={q.id} value={q.id}>{q.code} · {q.customer_name} · {q.item_name||"—"}</option>))}</select>
          <select value={f.request_type} onChange={(e)=>setF({...f, request_type: e.target.value})} className="px-3 py-2 rounded-lg border border-slate-300 text-sm">{TYPES.map(t=>(<option key={t}>{t}</option>))}</select>
        </div>
        <textarea placeholder="What do you need?" value={f.description} onChange={(e)=>setF({...f, description: e.target.value})} rows={2} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
        {err && (<div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{err}</div>)}
        <button className="bg-mirada-purple text-white px-4 py-2 rounded-lg text-sm font-medium">Create Request</button>
      </form>
      <div className="space-y-3">
        {rows.length === 0 ? (<div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-500">No designer requests.</div>) : rows.map((r)=>(
          <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-sm font-semibold">{r.query?.code || "(no query)"} · {r.request_type}</div>
                <div className="text-xs text-slate-500">{r.query?.customer_name} · By {r.designer?.full_name}</div>
              </div>
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${r.resolved?"bg-green-100 text-green-700":"bg-blue-100 text-blue-700"}`}>{r.resolved?"Resolved":"Open"}</span>
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
