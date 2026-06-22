"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createCostSheet } from "./actions";

export default function CostSheetForm({ currentUserId, queries }) {
  const router = useRouter();
  const [form, setForm] = useState({ query_id: "", rate_per_min: "", total_minutes: "", material_cost: "", embroidery_cost: "0", packaging_cost: "0", overhead_pct: "15", profit_pct: "10", royalty_pct: "0", notes: "" });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Live calc
  const calc = useMemo(() => {
    const rpm = Number(form.rate_per_min) || 0;
    const mins = Number(form.total_minutes) || 0;
    const mat = Number(form.material_cost) || 0;
    const emb = Number(form.embroidery_cost) || 0;
    const pkg = Number(form.packaging_cost) || 0;
    const oh = Number(form.overhead_pct) || 0;
    const prof = Number(form.profit_pct) || 0;
    const roy = Number(form.royalty_pct) || 0;
    const processCost = rpm * mins;
    const subtotal = processCost + mat + emb + pkg;
    const withOH = subtotal * (1 + oh / 100);
    const withRoy = withOH * (1 + roy / 100);
    const target = withRoy * (1 + prof / 100);
    return { processCost, subtotal, target };
  }, [form]);

  function update(field, val) { setForm((f) => ({...f, [field]: val})); }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!form.query_id) return setError("Select a query.");
    if (!form.rate_per_min || !form.total_minutes) return setError("Rate per min and total minutes are required.");
    setSaving(true);
    const r = await createCostSheet({
      query_id: form.query_id, prepared_by: currentUserId,
      rate_per_min: Number(form.rate_per_min), total_minutes: Number(form.total_minutes),
      material_cost: Number(form.material_cost) || 0, embroidery_cost: Number(form.embroidery_cost) || 0,
      packaging_cost: Number(form.packaging_cost) || 0, process_cost: calc.processCost,
      overhead_pct: Number(form.overhead_pct) || 0, profit_pct: Number(form.profit_pct) || 0,
      royalty_pct: Number(form.royalty_pct) || 0, target_cost: calc.target, notes: form.notes || null,
    });
    setSaving(false);
    if (r.error) return setError(r.error);
    router.push("/dashboard/cost-sheets");
    router.refresh();
  }

  const label = "block text-sm font-medium text-slate-700 mb-1";
  const input = "w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-mirada-purple text-sm";

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
      <div>
        <label className={label}>Query *</label>
        <select required value={form.query_id} onChange={(e)=>update("query_id", e.target.value)} className={input}>
          <option value="">Select query…</option>
          {queries.map((q)=>(<option key={q.id} value={q.id}>{q.code} · {q.customer_name} · {q.item_name || q.product_type}</option>))}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className={label}>Rate per min ₹ *</label><input type="number" step="0.01" required value={form.rate_per_min} onChange={(e)=>update("rate_per_min", e.target.value)} className={input} /></div>
        <div><label className={label}>Total Minutes (SAMs) *</label><input type="number" step="0.01" required value={form.total_minutes} onChange={(e)=>update("total_minutes", e.target.value)} className={input} /></div>
        <div><label className={label}>Process Cost ₹</label><input type="text" value={calc.processCost.toFixed(2)} readOnly className={input + " bg-slate-50"} /></div>
        <div><label className={label}>Material Cost ₹</label><input type="number" step="0.01" value={form.material_cost} onChange={(e)=>update("material_cost", e.target.value)} className={input} /></div>
        <div><label className={label}>Embroidery Cost ₹</label><input type="number" step="0.01" value={form.embroidery_cost} onChange={(e)=>update("embroidery_cost", e.target.value)} className={input} /></div>
        <div><label className={label}>Packaging Cost ₹</label><input type="number" step="0.01" value={form.packaging_cost} onChange={(e)=>update("packaging_cost", e.target.value)} className={input} /></div>
        <div><label className={label}>Overhead %</label><input type="number" step="0.1" value={form.overhead_pct} onChange={(e)=>update("overhead_pct", e.target.value)} className={input} /></div>
        <div><label className={label}>Royalty %</label><input type="number" step="0.1" value={form.royalty_pct} onChange={(e)=>update("royalty_pct", e.target.value)} className={input} /></div>
        <div><label className={label}>Profit %</label><input type="number" step="0.1" value={form.profit_pct} onChange={(e)=>update("profit_pct", e.target.value)} className={input} /></div>
      </div>
      <div className="bg-slate-50 rounded-lg p-4 grid grid-cols-3 text-sm">
        <div><div className="text-xs text-slate-500">Subtotal</div><div className="font-semibold tabular-nums">₹{calc.subtotal.toFixed(2)}</div></div>
        <div><div className="text-xs text-slate-500">Target Cost</div><div className="font-bold tabular-nums text-mirada-purple text-lg">₹{calc.target.toFixed(2)}</div></div>
        <div><div className="text-xs text-slate-500">Status</div><div className="text-slate-600">Draft</div></div>
      </div>
      <div><label className={label}>Notes</label><textarea value={form.notes} onChange={(e)=>update("notes", e.target.value)} className={input} rows={3} /></div>
      {error && (<div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>)}
      <div className="flex justify-end gap-3 pt-2 border-t">
        <button type="button" onClick={()=>router.push("/dashboard/cost-sheets")} className="px-4 py-2 rounded-lg border border-slate-300 text-sm">Cancel</button>
        <button type="submit" disabled={saving} className="bg-mirada-purple text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50">{saving ? "Saving…" : "Create Cost Sheet"}</button>
      </div>
    </form>
  );
}
