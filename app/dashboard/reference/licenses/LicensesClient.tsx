"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { addLicense, deleteLicense, toggleLicenseActive, addRoyalty, deleteRoyalty } from "../actions";

export default function LicensesClient({ licenses, royalty }) {
  const router = useRouter();
  const [name, setName] = useState(""); const [licensor, setLicensor] = useState("");
  const [rLic, setRLic] = useState(""); const [rPct, setRPct] = useState("");
  const [err, setErr] = useState(null);

  async function addL(e){ e.preventDefault(); if (!name) return; const r=await addLicense(name, licensor); if(r.error)return setErr(r.error); setName("");setLicensor("");router.refresh(); }
  async function addR(e){ e.preventDefault(); if (!rLic || !rPct) return; const r=await addRoyalty(rLic, Number(rPct)); if(r.error)return setErr(r.error); setRLic("");setRPct("");router.refresh(); }
  async function del(id){ if(!confirm("Delete?")) return; const r=await deleteLicense(id); if(r.error)return alert(r.error); router.refresh(); }
  async function delR(id){ if(!confirm("Delete?")) return; const r=await deleteRoyalty(id); if(r.error)return alert(r.error); router.refresh(); }
  async function tog(id, a){ const r=await toggleLicenseActive(id, a); if(r.error)return alert(r.error); router.refresh(); }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="font-semibold text-slate-800 mb-2">Licenses</h3>
        <form onSubmit={addL} className="flex gap-2 mb-3">
          <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="License name" className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-sm" />
          <input value={licensor} onChange={(e)=>setLicensor(e.target.value)} placeholder="Licensor" className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-sm" />
          <button className="bg-mirada-purple text-white px-3 py-2 rounded-lg text-sm font-medium">Add</button>
        </form>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm"><thead className="bg-slate-50 text-xs uppercase"><tr><th className="text-left px-3 py-2">Name</th><th className="text-left px-3 py-2">Licensor</th><th className="text-left px-3 py-2">Active</th><th></th></tr></thead><tbody>
            {licenses.map((l)=>(<tr key={l.id} className="border-t border-slate-100"><td className="px-3 py-2">{l.name}</td><td className="px-3 py-2 text-xs text-slate-500">{l.licensor||"—"}</td><td className="px-3 py-2"><input type="checkbox" defaultChecked={l.active} onChange={(e)=>tog(l.id, e.target.checked)} /></td><td className="px-3 py-2 text-right"><button onClick={()=>del(l.id)} className="text-xs text-red-600">×</button></td></tr>))}
          </tbody></table>
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-slate-800 mb-2">Royalty Rates</h3>
        <form onSubmit={addR} className="flex gap-2 mb-3">
          <select value={rLic} onChange={(e)=>setRLic(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-sm"><option value="">License…</option>{licenses.map(l=>(<option key={l.id} value={l.name}>{l.name}</option>))}</select>
          <input type="number" step="0.01" value={rPct} onChange={(e)=>setRPct(e.target.value)} placeholder="%" className="w-24 px-3 py-2 rounded-lg border border-slate-300 text-sm" />
          <button className="bg-mirada-purple text-white px-3 py-2 rounded-lg text-sm font-medium">Add</button>
        </form>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm"><thead className="bg-slate-50 text-xs uppercase"><tr><th className="text-left px-3 py-2">License</th><th className="text-right px-3 py-2">%</th><th></th></tr></thead><tbody>
            {royalty.map((r)=>(<tr key={r.id} className="border-t border-slate-100"><td className="px-3 py-2">{r.license_name}</td><td className="px-3 py-2 text-right tabular-nums">{r.royalty_pct}%</td><td className="px-3 py-2 text-right"><button onClick={()=>delR(r.id)} className="text-xs text-red-600">×</button></td></tr>))}
          </tbody></table>
        </div>
      </div>
      {err && (<div className="md:col-span-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{err}</div>)}
    </div>
  );
}
