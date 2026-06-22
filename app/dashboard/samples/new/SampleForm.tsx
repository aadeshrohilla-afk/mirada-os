"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSample } from "./actions";

const SAMPLE_TYPES = ["Initial Sample","Re-sample","Sample Duplication","Size Change","PPS","BPS"];

export default function SampleForm({ currentUserId, userRole, queries }) {
  const router = useRouter();
  const [form, setForm] = useState({ query_id: "", sample_type: "Initial Sample", dimension: "", designer_notes: "" });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!form.query_id) return setError("Please select a query.");
    setSaving(true);
    const r = await createSample({ ...form, designer_id: currentUserId });
    setSaving(false);
    if (r.error) return setError(r.error);
    router.push("/dashboard/samples");
    router.refresh();
  }

  const label = "block text-sm font-medium text-slate-700 mb-1";
  const input = "w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-mirada-purple text-sm";

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
      <div>
        <label className={label}>Query *</label>
        <select required value={form.query_id} onChange={(e)=>setForm({...form, query_id: e.target.value})} className={input}>
          <option value="">Select query...</option>
          {queries.map((q)=>(<option key={q.id} value={q.id}>{q.code} · {q.customer_name} · {q.item_name || q.product_type}</option>))}
        </select>
        {queries.length === 0 && (<p className="text-xs text-amber-700 mt-1">No queries assigned to you that are open for sampling.</p>)}
      </div>
      <div>
        <label className={label}>Sample Type *</label>
        <select required value={form.sample_type} onChange={(e)=>setForm({...form, sample_type: e.target.value})} className={input}>
          {SAMPLE_TYPES.map((t)=>(<option key={t} value={t}>{t}</option>))}
        </select>
      </div>
      <div>
        <label className={label}>Dimension</label>
        <input type="text" value={form.dimension} onChange={(e)=>setForm({...form, dimension: e.target.value})} className={input} placeholder="e.g. 30 x 40 cm" />
      </div>
      <div>
        <label className={label}>Designer Notes</label>
        <textarea value={form.designer_notes} onChange={(e)=>setForm({...form, designer_notes: e.target.value})} className={input} rows={4} />
      </div>
      {error && (<div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>)}
      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
        <button type="button" onClick={()=>router.push("/dashboard/samples")} className="px-4 py-2 rounded-lg border border-slate-300 text-sm">Cancel</button>
        <button type="submit" disabled={saving} className="bg-mirada-purple text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50">{saving ? "Creating…" : "Plan Sample"}</button>
      </div>
    </form>
  );
}
