"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { addPCM, updatePCM, deletePCM } from "./actions";

export default function PCMClient({ rows, productTypes, userRole }) {
  const router = useRouter();
  const canEdit = ["rd_executive","embroidery_executive","admin"].includes(userRole);
  const isAdmin = userRole === "admin";

  const [showAdd, setShowAdd] = useState(false);
  const [add, setAdd] = useState({ product_type: "", process_name: "", sams_per_op: "", rate_per_min: "", notes: "" });
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    if (!filter) return rows;
    const f = filter.toLowerCase();
    return rows.filter(r => r.product_type?.toLowerCase().includes(f) || r.process_name?.toLowerCase().includes(f));
  }, [rows, filter]);

  async function doAdd(e) {
    e.preventDefault();
    setError(null);
    if (!add.product_type || !add.process_name || !add.sams_per_op || !add.rate_per_min) return setError("All fields except notes are required.");
    const r = await addPCM({ ...add, sams_per_op: Number(add.sams_per_op), rate_per_min: Number(add.rate_per_min) });
    if (r.error) return setError(r.error);
    setAdd({ product_type: "", process_name: "", sams_per_op: "", rate_per_min: "", notes: "" });
    setShowAdd(false);
    router.refresh();
  }

  async function doDelete(id) {
    if (!confirm("Delete this PCM row?")) return;
    const r = await deletePCM(id);
    if (r.error) return alert(r.error);
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-slate-900">Process Cost Master</h1><p className="text-sm text-slate-500 mt-1">{rows.length} entries</p></div>
        {canEdit && (<button onClick={()=>setShowAdd(!showAdd)} className="bg-mirada-purple hover:bg-mirada-purple-dark text-white px-4 py-2.5 rounded-lg font-medium">{showAdd ? "Cancel" : "+ Add Entry"}</button>)}
      </div>
      {showAdd && canEdit && (
        <form onSubmit={doAdd} className="bg-white rounded-xl border border-slate-200 p-4 mb-4 grid grid-cols-1 md:grid-cols-5 gap-3">
          <select required value={add.product_type} onChange={(e)=>setAdd({...add, product_type: e.target.value})} className="px-3 py-2 rounded-lg border border-slate-300 text-sm"><option value="">Product type…</option>{productTypes.map(p=>(<option key={p.id} value={p.name}>{p.name}</option>))}</select>
          <input required placeholder="Process name" value={add.process_name} onChange={(e)=>setAdd({...add, process_name: e.target.value})} className="px-3 py-2 rounded-lg border border-slate-300 text-sm" />
          <input required type="number" step="0.001" placeholder="SAMs/op" value={add.sams_per_op} onChange={(e)=>setAdd({...add, sams_per_op: e.target.value})} className="px-3 py-2 rounded-lg border border-slate-300 text-sm" />
          <input required type="number" step="0.001" placeholder="Rate/min ₹" value={add.rate_per_min} onChange={(e)=>setAdd({...add, rate_per_min: e.target.value})} className="px-3 py-2 rounded-lg border border-slate-300 text-sm" />
          <button type="submit" className="bg-mirada-purple text-white px-4 py-2 rounded-lg text-sm font-medium">Add</button>
          {error && (<div className="md:col-span-5 text-sm text-red-600 bg-red-50 rounded-lg p-2">{error}</div>)}
        </form>
      )}
      <div className="mb-3"><input value={filter} onChange={(e)=>setFilter(e.target.value)} placeholder="Filter by product or process…" className="px-3 py-2 rounded-lg border border-slate-300 text-sm w-full md:w-80" /></div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-700">
            <tr><th className="text-left px-4 py-3">Product Type</th><th className="text-left px-4 py-3">Process</th><th className="text-right px-4 py-3">SAMs/Op</th><th className="text-right px-4 py-3">Rate/Min ₹</th><th className="text-right px-4 py-3">Cost/Unit ₹</th>{isAdmin && <th></th>}</tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (<tr><td colSpan={isAdmin?6:5} className="text-center py-12 text-slate-500">No entries match.</td></tr>) : filtered.map((r) => (
              <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3">{r.product_type}</td>
                <td className="px-4 py-3">{r.process_name}</td>
                <td className="px-4 py-3 text-right tabular-nums">{r.sams_per_op}</td>
                <td className="px-4 py-3 text-right tabular-nums">{r.rate_per_min}</td>
                <td className="px-4 py-3 text-right tabular-nums font-semibold">{r.cost_per_unit?.toFixed(4)}</td>
                {isAdmin && (<td className="px-4 py-3 text-right"><button onClick={()=>doDelete(r.id)} className="text-xs text-red-600 hover:underline">Delete</button></td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
