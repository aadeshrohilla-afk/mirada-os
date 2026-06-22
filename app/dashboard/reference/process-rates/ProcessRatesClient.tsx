"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { addProcessRate, deleteProcessRate } from "../actions";

export default function ProcessRatesClient({ rows }) {
  const router = useRouter();
  const [op, setOp] = useState(""); const [rate, setRate] = useState("");
  const [err, setErr] = useState(null);

  async function add(e){ e.preventDefault(); setErr(null); if(!op || !rate) return setErr("Both fields required."); const r=await addProcessRate(op, Number(rate)); if(r.error)return setErr(r.error); setOp("");setRate("");router.refresh(); }
  async function del(id){ if(!confirm("Delete?")) return; const r=await deleteProcessRate(id); if(r.error)return alert(r.error); router.refresh(); }

  return (
    <div>
      <form onSubmit={add} className="flex gap-2 mb-3">
        <input value={op} onChange={(e)=>setOp(e.target.value)} placeholder="Operation (e.g. Cutting)" className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-sm" />
        <input type="number" step="0.01" value={rate} onChange={(e)=>setRate(e.target.value)} placeholder="Rate ₹/min" className="w-32 px-3 py-2 rounded-lg border border-slate-300 text-sm" />
        <button className="bg-mirada-purple text-white px-3 py-2 rounded-lg text-sm font-medium">Add</button>
      </form>
      {err && (<div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2 mb-3">{err}</div>)}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-slate-50 text-xs uppercase"><tr><th className="text-left px-4 py-2">Operation</th><th className="text-right px-4 py-2">Rate ₹/min</th><th></th></tr></thead><tbody>
          {rows.length === 0 ? (<tr><td colSpan={3} className="text-center py-10 text-slate-500">No entries.</td></tr>) : rows.map((r)=>(<tr key={r.id} className="border-t border-slate-100"><td className="px-4 py-2">{r.operation}</td><td className="px-4 py-2 text-right tabular-nums">{r.rate_per_minute}</td><td className="px-4 py-2 text-right"><button onClick={()=>del(r.id)} className="text-xs text-red-600">×</button></td></tr>))}
        </tbody></table>
      </div>
    </div>
  );
}
