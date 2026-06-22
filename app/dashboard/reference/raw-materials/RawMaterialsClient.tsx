"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { addRawMaterial, deleteRawMaterial } from "../actions";

export default function RawMaterialsClient({ rows }) {
  const router = useRouter();
  const [f, setF] = useState({ category: "", material: "", unit: "", rate_per_unit: "", notes: "" });
  const [err, setErr] = useState(null);

  async function add(e) {
    e.preventDefault(); setErr(null);
    if (!f.category || !f.material || !f.unit || !f.rate_per_unit) return setErr("Category, material, unit, and rate are required.");
    const r = await addRawMaterial({ ...f, rate_per_unit: Number(f.rate_per_unit), notes: f.notes || null });
    if (r.error) return setErr(r.error);
    setF({ category: "", material: "", unit: "", rate_per_unit: "", notes: "" });
    router.refresh();
  }
  async function del(id) { if (!confirm("Delete?")) return; const r = await deleteRawMaterial(id); if (r.error) return alert(r.error); router.refresh(); }

  const inp = "px-3 py-2 rounded-lg border border-slate-300 text-sm";

  return (
    <div>
      <form onSubmit={add} className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-3">
        <input placeholder="Category" value={f.category} onChange={(e)=>setF({...f, category: e.target.value})} className={inp} />
        <input placeholder="Material" value={f.material} onChange={(e)=>setF({...f, material: e.target.value})} className={inp} />
        <input placeholder="Unit (kg/m/pc)" value={f.unit} onChange={(e)=>setF({...f, unit: e.target.value})} className={inp} />
        <input type="number" step="0.01" placeholder="Rate ₹" value={f.rate_per_unit} onChange={(e)=>setF({...f, rate_per_unit: e.target.value})} className={inp} />
        <input placeholder="Notes (optional)" value={f.notes} onChange={(e)=>setF({...f, notes: e.target.value})} className={inp} />
        <button className="bg-mirada-purple text-white px-3 py-2 rounded-lg text-sm font-medium">Add</button>
      </form>
      {err && (<div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2 mb-3">{err}</div>)}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-slate-50 text-xs uppercase"><tr><th className="text-left px-4 py-2">Category</th><th className="text-left px-4 py-2">Material</th><th className="text-left px-4 py-2">Unit</th><th className="text-right px-4 py-2">Rate ₹</th><th className="text-left px-4 py-2">Notes</th><th></th></tr></thead><tbody>
          {rows.length === 0 ? (<tr><td colSpan={6} className="text-center py-10 text-slate-500">No entries.</td></tr>) : rows.map((r)=>(<tr key={r.id} className="border-t border-slate-100"><td className="px-4 py-2">{r.category}</td><td className="px-4 py-2">{r.material}</td><td className="px-4 py-2 text-xs">{r.unit}</td><td className="px-4 py-2 text-right tabular-nums">{r.rate_per_unit}</td><td className="px-4 py-2 text-xs text-slate-500">{r.notes || "—"}</td><td className="px-4 py-2 text-right"><button onClick={()=>del(r.id)} className="text-xs text-red-600">×</button></td></tr>))}
        </tbody></table>
      </div>
    </div>
  );
}
