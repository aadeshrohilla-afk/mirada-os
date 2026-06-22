"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { upsertLearningCurve, deleteLearningCurve } from "../actions";

export default function LearningCurveClient({ rows }) {
  const router = useRouter();
  const [f, setF] = useState({ qty_bucket: "", cutting_pct: "100", stitching_pct: "100", finishing_pct: "100", packing_pct: "100" });
  const [err, setErr] = useState(null);

  async function add(e){ e.preventDefault(); setErr(null); const r=await upsertLearningCurve({ qty_bucket: Number(f.qty_bucket), cutting_pct: Number(f.cutting_pct), stitching_pct: Number(f.stitching_pct), finishing_pct: Number(f.finishing_pct), packing_pct: Number(f.packing_pct) }); if(r.error)return setErr(r.error); setF({qty_bucket:"",cutting_pct:"100",stitching_pct:"100",finishing_pct:"100",packing_pct:"100"}); router.refresh(); }
  async function del(b){ if(!confirm("Delete?")) return; const r=await deleteLearningCurve(b); if(r.error)return alert(r.error); router.refresh(); }

  const inp = "px-3 py-2 rounded-lg border border-slate-300 text-sm";

  return (
    <div>
      <p className="text-xs text-slate-500 mb-2">Learning curve multiplies SAMs by these % at each qty bucket. Set qty bucket = the lower-bound (e.g. 1000 means "1000+ units").</p>
      <form onSubmit={add} className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-3">
        <input type="number" placeholder="Qty bucket" value={f.qty_bucket} onChange={(e)=>setF({...f, qty_bucket: e.target.value})} className={inp} required />
        <input type="number" step="0.01" placeholder="Cutting %" value={f.cutting_pct} onChange={(e)=>setF({...f, cutting_pct: e.target.value})} className={inp} />
        <input type="number" step="0.01" placeholder="Stitching %" value={f.stitching_pct} onChange={(e)=>setF({...f, stitching_pct: e.target.value})} className={inp} />
        <input type="number" step="0.01" placeholder="Finishing %" value={f.finishing_pct} onChange={(e)=>setF({...f, finishing_pct: e.target.value})} className={inp} />
        <input type="number" step="0.01" placeholder="Packing %" value={f.packing_pct} onChange={(e)=>setF({...f, packing_pct: e.target.value})} className={inp} />
        <button className="bg-mirada-purple text-white px-3 py-2 rounded-lg text-sm font-medium">Add / Update</button>
      </form>
      {err && (<div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2 mb-3">{err}</div>)}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-slate-50 text-xs uppercase"><tr><th className="text-left px-4 py-2">Qty bucket (≥)</th><th className="text-right px-4 py-2">Cutting %</th><th className="text-right px-4 py-2">Stitching %</th><th className="text-right px-4 py-2">Finishing %</th><th className="text-right px-4 py-2">Packing %</th><th></th></tr></thead><tbody>
          {rows.length === 0 ? (<tr><td colSpan={6} className="text-center py-10 text-slate-500">No entries.</td></tr>) : rows.map((r)=>(<tr key={r.qty_bucket} className="border-t border-slate-100"><td className="px-4 py-2 tabular-nums">{r.qty_bucket}</td><td className="px-4 py-2 text-right tabular-nums">{r.cutting_pct}</td><td className="px-4 py-2 text-right tabular-nums">{r.stitching_pct}</td><td className="px-4 py-2 text-right tabular-nums">{r.finishing_pct}</td><td className="px-4 py-2 text-right tabular-nums">{r.packing_pct}</td><td className="px-4 py-2 text-right"><button onClick={()=>del(r.qty_bucket)} className="text-xs text-red-600">×</button></td></tr>))}
        </tbody></table>
      </div>
    </div>
  );
}
