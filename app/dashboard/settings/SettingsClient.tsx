"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSetting } from "./actions";

const FIELDS = [
  { key: "default_overhead_pct", label: "Default Overhead %", type: "number" },
  { key: "default_profit_pct", label: "Default Profit %", type: "number" },
  { key: "default_royalty_pct", label: "Default Royalty %", type: "number" },
];

export default function SettingsClient({ settings }) {
  const router = useRouter();
  const map = settings.reduce((m, s) => { m[s.key] = s.value; return m; }, {});
  const [vals, setVals] = useState(FIELDS.reduce((o, f) => ({...o, [f.key]: map[f.key] || ""}), {}));
  const [err, setErr] = useState(null);
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState(false);

  async function save(e) {
    e.preventDefault();
    setSaving(true); setErr(null); setOk(false);
    for (const f of FIELDS) {
      const r = await updateSetting(f.key, vals[f.key]);
      if (r.error) { setSaving(false); return setErr(r.error); }
    }
    setSaving(false); setOk(true);
    router.refresh();
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-1">Settings</h1>
      <p className="text-sm text-slate-500 mb-6">Defaults applied when creating a new cost sheet. R&D can override per cost sheet.</p>
      <form onSubmit={save} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        {FIELDS.map(f => (
          <div key={f.key}><label className="block text-sm font-medium mb-1">{f.label}</label><input type={f.type} step="0.1" value={vals[f.key]} onChange={(e)=>setVals({...vals, [f.key]: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" /></div>
        ))}
        {err && (<div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{err}</div>)}
        {ok && (<div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">Settings saved.</div>)}
        <button type="submit" disabled={saving} className="bg-mirada-purple text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50">{saving ? "Saving…" : "Save"}</button>
      </form>
    </div>
  );
}
