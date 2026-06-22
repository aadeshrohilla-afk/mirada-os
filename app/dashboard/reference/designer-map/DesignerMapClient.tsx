"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDesignerMap, deleteDesignerMap } from "../actions";

export default function DesignerMapClient({ rows, customers, productTypes, licenses, designers }) {
  const router = useRouter();
  const [f, setF] = useState({ customer_name: "", product_type: "", license_name: "", designer_id: "", priority: "1", notes: "" });
  const [err, setErr] = useState(null);

  async function add(e){ e.preventDefault(); setErr(null); if(!f.designer_id) return setErr("Designer required."); const r=await addDesignerMap({ customer_name: f.customer_name || null, product_type: f.product_type || null, license_name: f.license_name || null, designer_id: f.designer_id, priority: Number(f.priority), notes: f.notes || null, active: true }); if(r.error)return setErr(r.error); setF({customer_name:"",product_type:"",license_name:"",designer_id:"",priority:"1",notes:""}); router.refresh(); }
  async function del(id){ if(!confirm("Delete?")) return; const r=await deleteDesignerMap(id); if(r.error)return alert(r.error); router.refresh(); }

  const inp = "px-3 py-2 rounded-lg border border-slate-300 text-sm";

  return (
    <div>
      <p className="text-xs text-slate-500 mb-2">Rules auto-assign a designer to new queries. Leave a field blank to match anything. Priority 1 wins ties.</p>
      <form onSubmit={add} className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-3">
        <select value={f.customer_name} onChange={(e)=>setF({...f, customer_name: e.target.value})} className={inp}><option value="">Any customer</option>{customers.map(c=>(<option key={c.name}>{c.name}</option>))}</select>
        <select value={f.product_type} onChange={(e)=>setF({...f, product_type: e.target.value})} className={inp}><option value="">Any product</option>{productTypes.map(p=>(<option key={p.name}>{p.name}</option>))}</select>
        <select value={f.license_name} onChange={(e)=>setF({...f, license_name: e.target.value})} className={inp}><option value="">Any license</option>{licenses.map(l=>(<option key={l.name}>{l.name}</option>))}</select>
        <select value={f.designer_id} onChange={(e)=>setF({...f, designer_id: e.target.value})} className={inp}><option value="">Designer *</option>{designers.map(d=>(<option key={d.id} value={d.id}>{d.full_name || d.email}</option>))}</select>
        <input type="number" min="1" value={f.priority} onChange={(e)=>setF({...f, priority: e.target.value})} placeholder="Priority" className={inp} />
        <button className="bg-mirada-purple text-white px-3 py-2 rounded-lg text-sm font-medium">Add Rule</button>
      </form>
      {err && (<div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2 mb-3">{err}</div>)}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-slate-50 text-xs uppercase"><tr><th className="text-left px-3 py-2">Customer</th><th className="text-left px-3 py-2">Product</th><th className="text-left px-3 py-2">License</th><th className="text-left px-3 py-2">Designer</th><th className="text-right px-3 py-2">Priority</th><th></th></tr></thead><tbody>
          {rows.length === 0 ? (<tr><td colSpan={6} className="text-center py-10 text-slate-500">No rules.</td></tr>) : rows.map((r)=>(<tr key={r.id} className="border-t border-slate-100"><td className="px-3 py-2 text-xs">{r.customer_name||<span className="text-slate-400">any</span>}</td><td className="px-3 py-2 text-xs">{r.product_type||<span className="text-slate-400">any</span>}</td><td className="px-3 py-2 text-xs">{r.license_name||<span className="text-slate-400">any</span>}</td><td className="px-3 py-2">{r.designer?.full_name||r.designer?.email}</td><td className="px-3 py-2 text-right">{r.priority}</td><td className="px-3 py-2 text-right"><button onClick={()=>del(r.id)} className="text-xs text-red-600">×</button></td></tr>))}
        </tbody></table>
      </div>
    </div>
  );
}
