"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { addEmbRate, deactivateEmbRate } from "./actions";

export default function EmbroideryClient({ rows, currentUserId, userRole }) {
  const router = useRouter();
  const [f, setF] = useState({ rate_per_stitch: "", min_charge_per_piece: "", notes: "" });
  const [err, setErr] = useState(null);

  async function add(e){ e.preventDefault(); setErr(null); if(!f.rate_per_stitch || !f.min_charge_per_piece) return setErr("Rate and min charge required."); const r = await addEmbRate({...f, rate_per_stitch: Number(f.rate_per_stitch), min_charge_per_piece: Number(f.min_charge_per_piece), executive_id: currentUserId}); if(r.error) return setErr(r.error); setF({rate_per_stitch:"",min_charge_per_piece:"",notes:""}); router.refresh(); }
  async function deact(id){ if(!confirm("Deactivate this rate?")) return; const r = await deactivateEmbRate(id); if(r.error) return alert(r.error); router.refresh(); }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Embroidery Rates</h1>
      <p className="text-sm text-slate-500 mb-6">Embroidery executive sets rate per stitch + minimum charge per piece. Used in cost sheet Value-Add calculations.</p>
      <form onSubmit={add} className="bg-white rounded-xl border border-slate-200 p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div><label className="block text-xs font-medium mb-1">Rate per Stitch ₹</label><input type="number" step="0.000001" value={f.rate_per_stitch} onChange={(e)=>setF({...f, rate_per_stitch: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" /></div>
        <div><label className="block text-xs font-medium mb-1">Min Charge / Piece ₹</label><input type="number" step="0.01" value={f.min_charge_per_piece} onChange={(e)=>setF({...f, min_charge_per_piece: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" /></div>
        <div><label className="block text-xs font-medium mb-1">Notes</label><input value={f.notes} onChange={(e)=>setF({...f, notes: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" /></div>
        <div className="flex items-end"><button className="bg-mirada-purple text-white px-4 py-2 rounded-lg text-sm font-medium">Add Rate</button></div>
        {err && (<div className="md:col-span-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{err}</div>)}
      </form>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-slate-50 text-xs uppercase"><tr><th className="text-left px-4 py-2">Set By</th><th className="text-right px-4 py-2">Rate / Stitch ₹</th><th className="text-right px-4 py-2">Min ₹ / Piece</th><th className="text-left px-4 py-2">Notes</th><th className="text-left px-4 py-2">Active</th><th></th></tr></thead><tbody>
          {rows.length === 0 ? (<tr><td colSpan={6} className="text-center py-10 text-slate-500">No rates set yet.</td></tr>) : rows.map((r)=>(<tr key={r.id} className="border-t border-slate-100"><td className="px-4 py-2 text-xs">{r.executive?.full_name}</td><td className="px-4 py-2 text-right tabular-nums">{r.rate_per_stitch}</td><td className="px-4 py-2 text-right tabular-nums">{r.min_charge_per_piece}</td><td className="px-4 py-2 text-xs">{r.notes||"—"}</td><td className="px-4 py-2"><span className={`inline-block px-2 py-0.5 rounded-full text-xs ${r.active?"bg-green-100 text-green-700":"bg-slate-100 text-slate-600"}`}>{r.active?"Active":"Inactive"}</span></td><td className="px-4 py-2 text-right">{r.active && (<button onClick={()=>deact(r.id)} className="text-xs text-red-600">Deactivate</button>)}</td></tr>))}
        </tbody></table>
      </div>
    </div>
  );
}
