"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { addSimple, deleteSimple, toggleSimple } from "./actions";

export default function SimpleListClient({ rows, label, table }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [err, setErr] = useState(null);

  async function add(e) {
    e.preventDefault();
    setErr(null);
    if (!name.trim()) return;
    const r = await addSimple(table, name.trim());
    if (r.error) return setErr(r.error);
    setName("");
    router.refresh();
  }
  async function del(id) {
    if (!confirm("Delete this entry?")) return;
    const r = await deleteSimple(table, id);
    if (r.error) return alert(r.error);
    router.refresh();
  }
  async function toggle(id, active) {
    const r = await toggleSimple(table, id, active);
    if (r.error) return alert(r.error);
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={add} className="flex gap-2 mb-4">
        <input value={name} onChange={(e)=>setName(e.target.value)} placeholder={`New ${label}`} className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-sm" />
        <button type="submit" className="bg-mirada-purple text-white px-4 py-2 rounded-lg text-sm font-medium">Add</button>
      </form>
      {err && (<div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2 mb-3">{err}</div>)}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-700"><tr><th className="text-left px-4 py-3">Name</th><th className="text-left px-4 py-3">Active</th><th className="text-right px-4 py-3"></th></tr></thead>
          <tbody>
            {rows.length === 0 ? (<tr><td colSpan={3} className="text-center py-10 text-slate-500">No entries.</td></tr>) : rows.map((r) => (
              <tr key={r.id} className="border-t border-slate-100"><td className="px-4 py-3">{r.name}</td><td className="px-4 py-3"><label className="inline-flex items-center gap-2 text-xs"><input type="checkbox" defaultChecked={r.active} onChange={(e)=>toggle(r.id, e.target.checked)} />{r.active ? "Active" : "Inactive"}</label></td><td className="px-4 py-3 text-right"><button onClick={()=>del(r.id)} className="text-xs text-red-600 hover:underline">Delete</button></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
