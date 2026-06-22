"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { addLabel, deleteLabel, addPackaging, deletePackaging } from "../actions";

export default function LabelPkgClient({ labels, packaging }) {
  const router = useRouter();
  const [lab, setLab] = useState({ type: "", gsm: "", rate: "" });
  const [pkg, setPkg] = useState({ type: "MasterCarton", spec: "", qty: "1", rate: "" });
  const [err, setErr] = useState(null);

  async function addL(e){ e.preventDefault(); setErr(null); if(!lab.type || !lab.rate) return setErr("Type and rate required."); const r=await addLabel(lab.type, lab.gsm ? Number(lab.gsm) : null, Number(lab.rate)); if(r.error)return setErr(r.error); setLab({type:"",gsm:"",rate:""}); router.refresh(); }
  async function addP(e){ e.preventDefault(); setErr(null); if(!pkg.spec || !pkg.rate) return setErr("Spec and rate required."); const r=await addPackaging({ packaging_type: pkg.type, spec: pkg.spec, qty_per_unit: Number(pkg.qty) || 1, rate_per_unit: Number(pkg.rate) }); if(r.error)return setErr(r.error); setPkg({type:"MasterCarton",spec:"",qty:"1",rate:""}); router.refresh(); }
  async function delL(id){ if(!confirm("Delete?")) return; const r=await deleteLabel(id); if(r.error)return alert(r.error); router.refresh(); }
  async function delP(id){ if(!confirm("Delete?")) return; const r=await deletePackaging(id); if(r.error)return alert(r.error); router.refresh(); }

  const inp = "px-3 py-2 rounded-lg border border-slate-300 text-sm";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="font-semibold text-slate-800 mb-2">Labels</h3>
        <form onSubmit={addL} className="flex gap-2 mb-3 flex-wrap">
          <input placeholder="Label type" value={lab.type} onChange={(e)=>setLab({...lab,type:e.target.value})} className={inp + " flex-1 min-w-[120px]"} />
          <input placeholder="GSM" type="number" value={lab.gsm} onChange={(e)=>setLab({...lab,gsm:e.target.value})} className={inp + " w-20"} />
          <input placeholder="Rate ₹/pc" type="number" step="0.01" value={lab.rate} onChange={(e)=>setLab({...lab,rate:e.target.value})} className={inp + " w-28"} />
          <button className="bg-mirada-purple text-white px-3 py-2 rounded-lg text-sm font-medium">Add</button>
        </form>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm"><thead className="bg-slate-50 text-xs uppercase"><tr><th className="text-left px-3 py-2">Type</th><th className="text-left px-3 py-2">GSM</th><th className="text-right px-3 py-2">Rate ₹</th><th></th></tr></thead><tbody>
            {labels.map((l)=>(<tr key={l.id} className="border-t border-slate-100"><td className="px-3 py-2">{l.label_type}</td><td className="px-3 py-2 text-xs">{l.hang_tag_gsm || "—"}</td><td className="px-3 py-2 text-right tabular-nums">{l.rate_per_piece}</td><td className="px-3 py-2 text-right"><button onClick={()=>delL(l.id)} className="text-xs text-red-600">×</button></td></tr>))}
          </tbody></table>
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-slate-800 mb-2">Packaging</h3>
        <form onSubmit={addP} className="flex gap-2 mb-3 flex-wrap">
          <select value={pkg.type} onChange={(e)=>setPkg({...pkg,type:e.target.value})} className={inp}><option>MasterCarton</option><option>InnerCarton</option><option>Polybag</option></select>
          <input placeholder="Spec" value={pkg.spec} onChange={(e)=>setPkg({...pkg,spec:e.target.value})} className={inp + " flex-1 min-w-[80px]"} />
          <input placeholder="Qty" type="number" value={pkg.qty} onChange={(e)=>setPkg({...pkg,qty:e.target.value})} className={inp + " w-16"} />
          <input placeholder="Rate ₹" type="number" step="0.01" value={pkg.rate} onChange={(e)=>setPkg({...pkg,rate:e.target.value})} className={inp + " w-24"} />
          <button className="bg-mirada-purple text-white px-3 py-2 rounded-lg text-sm font-medium">Add</button>
        </form>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm"><thead className="bg-slate-50 text-xs uppercase"><tr><th className="text-left px-3 py-2">Type</th><th className="text-left px-3 py-2">Spec</th><th className="text-right px-3 py-2">Qty</th><th className="text-right px-3 py-2">Rate ₹</th><th></th></tr></thead><tbody>
            {packaging.map((p)=>(<tr key={p.id} className="border-t border-slate-100"><td className="px-3 py-2">{p.packaging_type}</td><td className="px-3 py-2 text-xs">{p.spec}</td><td className="px-3 py-2 text-right tabular-nums">{p.qty_per_unit}</td><td className="px-3 py-2 text-right tabular-nums">{p.rate_per_unit}</td><td className="px-3 py-2 text-right"><button onClick={()=>delP(p.id)} className="text-xs text-red-600">×</button></td></tr>))}
          </tbody></table>
        </div>
      </div>
      {err && (<div className="md:col-span-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{err}</div>)}
    </div>
  );
}
