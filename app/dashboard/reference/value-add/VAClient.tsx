"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { addVA, deleteVA, toggleVA } from "./actions";

export default function VAClient({ rows }) {
  const router = useRouter();
  const [f, setF] = useState({ name: "", unit: "piece", rate_per_unit: "" });
  const [err, setErr] = useState(null);

  async function add(e){ e.preventDefault(); setErr(null); if(!f.name || !f.rate_per_unit) return setErr("Name and rate required."); const r = await addVA({...f, rate_per_unit: Number(f.rate_per_unit)}); if(r.error) return setErr(r.error); setF({name:"",unit:"piece",rate_per_unit:""}); router.refresh(); }
  async function del(id){ if(!confirm("Delete?")) return; const r = await deleteVA(id); if(r.error) return alert(r.error); router.refresh(); }
  async function tog(id, a){ const r = await toggleVA(id, a); if(r.error) return alert(r.error); router.refresh(); }

  return (
    <div>
      <form onSubmit={add} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <input placeholder="Name (e.g. Sublimation)" value={f.name} onChange={(e)=>setF({...f, name: e.target.value})} className="px-3 py-2 rounded-lg border border-slate-300 text-sm" />
        <input placeholder="Unit" value={f.unit} onChange={(e)=>setF({...f, unit: e.target.value})} className="px-3 py-2 rounded-lg border border-slate-300 text-sm" />
        <input type="number" step="0.01" placeholder="Rate ₹/unit" value={f.rate_per_unit} onChange={(e)=>setF({...f, rate_per_unit: e.target.value})} className="px-3 py-2 rounded-lg border border-slate-300 text-sm" />
        <button className="bg-mirada-purple text-white px-3 py-2 rounded-lg text-sm font-medium">Add</button>
      </form>
      {err && (<div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2 mb-3">{err}</div>)}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-slate-50 text-xs uppercase"><tr><th className="text-left px-4 py-2">Name</th><th className="text-left px-4 py-2">Unit</th><th className="text-right px-4 py-2">Rate ₹</th><th className="text-left px-4 py-2">Active</th><th></th></tr></thead><tbody>
          {rows.length === 0 ? (<tr><td colSpan={5} className="text-center py-10 text-slate-500">No entries.</td></tr>) : rows.map((r)=>(<tr key={r.id} className="border-t border-slate-100"><td className="px-4 py-2">{r.name}</td><td className="px-4 py-2 text-xs">{r.unit}</td><td className="px-4 py-2 text-right tabular-nums">{r.rate_per_unit}</td><td className="px-4 py-2"><input type="checkbox" defaultChecked={r.active} onChange={(e)=>tog(r.id, e.target.checked)} /></td><td className="px-4 py-2 text-right"><button onClick={()=>del(r.id)} className="text-xs text-red-600">×</button></td></tr>))}
        </tbody></table>
      </div>
    </div>
  );
}
