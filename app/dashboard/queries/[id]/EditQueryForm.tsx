"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateQuery, deleteQuery } from "./actions";

export default function EditQueryForm({ query, canEdit, isAdmin, customers, productTypes, themes, designers }) {
  const router = useRouter();
  const [form, setForm] = useState({
    customer_name: query.customer_name, product_type: query.product_type, theme: query.theme || "",
    item_name: query.item_name || "", quantity: String(query.quantity),
    sampling_required: query.sampling_required ? "yes" : "no",
    sample_target_date: query.sample_target_date || "", cost_target_date: query.cost_target_date || "",
    assigned_designer_id: query.assigned_designer_id || "", status: query.status, notes: query.notes || "",
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  async function onSave(e) {
    e.preventDefault();
    setSaving(true); setError(null);
    const r = await updateQuery(query.id, {
      customer_name: form.customer_name, product_type: form.product_type, theme: form.theme || null,
      item_name: form.item_name || null, quantity: Number(form.quantity),
      sampling_required: form.sampling_required === "yes",
      sample_target_date: form.sampling_required === "yes" ? form.sample_target_date : null,
      cost_target_date: form.cost_target_date, assigned_designer_id: form.assigned_designer_id || null,
      status: form.status, notes: form.notes || null,
    });
    setSaving(false);
    if (r.error) return setError(r.error);
    router.push("/dashboard/queries");
    router.refresh();
  }

  async function onDelete() {
    if (!confirm("Delete this query? This also removes all related samples and cost sheets.")) return;
    const r = await deleteQuery(query.id);
    if (r.error) return setError(r.error);
    router.push("/dashboard/queries");
    router.refresh();
  }

  const label = "block text-sm font-medium text-slate-700 mb-1";
  const input = "w-full px-3 py-2 rounded-lg border border-slate-300 text-sm";

  if (!canEdit) return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 text-sm text-slate-600">
      You can view this query but cannot edit it.
    </div>
  );

  return (
    <form onSubmit={onSave} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={label}>Customer *</label><select required value={form.customer_name} onChange={(e)=>setForm({...form, customer_name: e.target.value})} className={input}>{customers.map(c=>(<option key={c.id} value={c.name}>{c.name}</option>))}</select></div>
        <div><label className={label}>Product Type *</label><select required value={form.product_type} onChange={(e)=>setForm({...form, product_type: e.target.value})} className={input}>{productTypes.map(p=>(<option key={p.id} value={p.name}>{p.name}</option>))}</select></div>
        <div><label className={label}>Theme</label><select value={form.theme} onChange={(e)=>setForm({...form, theme: e.target.value})} className={input}><option value="">(none)</option>{themes.map(t=>(<option key={t.id} value={t.name}>{t.name}</option>))}</select></div>
        <div><label className={label}>Item Name</label><input value={form.item_name} onChange={(e)=>setForm({...form, item_name: e.target.value})} className={input} /></div>
        <div><label className={label}>Quantity</label><input type="number" min="1" value={form.quantity} onChange={(e)=>setForm({...form, quantity: e.target.value})} className={input} /></div>
        <div><label className={label}>Sampling Required</label><select value={form.sampling_required} onChange={(e)=>setForm({...form, sampling_required: e.target.value})} className={input}><option value="yes">Yes</option><option value="no">No</option></select></div>
        <div><label className={label}>Sample Target</label><input type="date" disabled={form.sampling_required==="no"} value={form.sample_target_date} onChange={(e)=>setForm({...form, sample_target_date: e.target.value})} className={input + " disabled:bg-slate-100"} /></div>
        <div><label className={label}>Cost Target</label><input type="date" value={form.cost_target_date} onChange={(e)=>setForm({...form, cost_target_date: e.target.value})} className={input} /></div>
        <div className="md:col-span-2"><label className={label}>Designer</label><select value={form.assigned_designer_id} onChange={(e)=>setForm({...form, assigned_designer_id: e.target.value})} className={input}><option value="">Unassigned</option>{designers.map(d=>(<option key={d.id} value={d.id}>{d.full_name || d.email}</option>))}</select></div>
        {isAdmin && (<div className="md:col-span-2"><label className={label}>Status</label><select value={form.status} onChange={(e)=>setForm({...form, status: e.target.value})} className={input}>{["open","in_sampling","sample_approved","in_costing","cost_approved","completed","on_hold","cancelled"].map(s=>(<option key={s} value={s}>{s}</option>))}</select></div>)}
        <div className="md:col-span-2"><label className={label}>Notes</label><textarea value={form.notes} onChange={(e)=>setForm({...form, notes: e.target.value})} className={input} rows={3} /></div>
      </div>
      {error && (<div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>)}
      <div className="flex justify-between pt-2 border-t border-slate-100">
        {isAdmin ? (<button type="button" onClick={onDelete} className="text-red-600 hover:underline text-sm">Delete query</button>) : <div />}
        <div className="flex gap-3">
          <button type="button" onClick={()=>router.push("/dashboard/queries")} className="px-4 py-2 rounded-lg border border-slate-300 text-sm">Cancel</button>
          <button type="submit" disabled={saving} className="bg-mirada-purple text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50">{saving ? "Saving…" : "Save Changes"}</button>
        </div>
      </div>
    </form>
  );
}
