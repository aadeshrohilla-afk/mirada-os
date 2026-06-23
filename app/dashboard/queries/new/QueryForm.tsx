"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createQuery } from "./actions";

function findMatch(rules, { customer, productType, theme }) {
  if (!rules || rules.length === 0) return null;
  // Match on customer, product, AND license_name (Theme in our form). Most specific wins.
  const matches = rules
    .filter(r =>
      (!r.customer_name || r.customer_name === customer) &&
      (!r.product_type || r.product_type === productType) &&
      (!r.license_name || r.license_name === theme)
    )
    .map(r => ({ ...r,
      specificity: (r.customer_name ? 4 : 0) + (r.license_name ? 2 : 0) + (r.product_type ? 1 : 0)
    }))
    .sort((a, b) => b.specificity - a.specificity || (a.priority || 99) - (b.priority || 99));
  return matches[0] || null;
}

export default function QueryForm({ currentUserId, currentUserRole, currentUserPrefix, customers, productTypes, themes, designers, merchandisers, designerMap }) {
  const router = useRouter();
  const isAdmin = currentUserRole === "admin";
  const [form, setForm] = useState({
    merchandiser_id: isAdmin ? (merchandisers[0]?.id || "") : currentUserId,
    customer_name: "", product_type: "", theme: "", item_name: "", quantity: "",
    sampling_required: "yes", sample_target_date: "", cost_target_date: "",
    assigned_designer_id: "", notes: "", override_designer: false,
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  function update(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  const matched = useMemo(() => findMatch(designerMap, { customer: form.customer_name, productType: form.product_type, theme: form.theme }), [designerMap, form.customer_name, form.product_type, form.theme]);
  const matchedDesigner = matched ? designers.find(d => d.id === matched.designer_id) : null;
  const effectiveDesignerId = form.override_designer ? form.assigned_designer_id : (matched?.designer_id || form.assigned_designer_id);

  async function onSubmit(e) {
    e.preventDefault(); setError(null);
    if (!form.customer_name) return setError("Customer is required.");
    if (!form.product_type) return setError("Product type is required.");
    if (!form.quantity || Number(form.quantity) <= 0) return setError("Quantity must be positive.");
    if (!form.cost_target_date) return setError("Cost target date is required.");
    if (form.sampling_required === "yes" && !form.sample_target_date) return setError("Sample target date is required when sampling is needed.");

    setSaving(true);
    const result = await createQuery({
      merchandiser_id: form.merchandiser_id, customer_name: form.customer_name, product_type: form.product_type,
      theme: form.theme || null, item_name: form.item_name || null, quantity: Number(form.quantity),
      sampling_required: form.sampling_required === "yes",
      sample_target_date: form.sampling_required === "yes" ? form.sample_target_date : null,
      cost_target_date: form.cost_target_date,
      assigned_designer_id: effectiveDesignerId || null,
      notes: form.notes || null,
    });
    setSaving(false);
    if (result.error) { setError(result.error); return; }
    router.push("/dashboard/queries"); router.refresh();
  }

  const label = "block text-sm font-medium text-slate-700 mb-1";
  const input = "w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-mirada-purple text-sm";

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
      {isAdmin && (
        <div>
          <label className={label}>Merchandiser *</label>
          <select required value={form.merchandiser_id} onChange={(e) => update("merchandiser_id", e.target.value)} className={input}>
            <option value="">Select merchandiser...</option>
            {merchandisers.map((m) => (<option key={m.id} value={m.id}>{m.full_name || m.email}</option>))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={label}>Customer *</label><select required value={form.customer_name} onChange={(e) => update("customer_name", e.target.value)} className={input}><option value="">Select customer...</option>{customers.map((c) => (<option key={c.id} value={c.name}>{c.name}</option>))}</select></div>
        <div><label className={label}>Product Type *</label><select required value={form.product_type} onChange={(e) => update("product_type", e.target.value)} className={input}><option value="">Select product type...</option>{productTypes.map((p) => (<option key={p.id} value={p.name}>{p.name}</option>))}</select></div>
        <div><label className={label}>Theme / License</label><select value={form.theme} onChange={(e) => update("theme", e.target.value)} className={input}><option value="">(none)</option>{themes.map((t) => (<option key={t.id} value={t.name}>{t.name}</option>))}</select></div>
        <div><label className={label}>Item Name</label><input type="text" value={form.item_name} onChange={(e) => update("item_name", e.target.value)} className={input} placeholder="e.g. Marvel Tee" /></div>
        <div><label className={label}>Quantity *</label><input type="number" required min="1" value={form.quantity} onChange={(e) => update("quantity", e.target.value)} className={input} /></div>
        <div><label className={label}>Sampling Required *</label><select required value={form.sampling_required} onChange={(e) => update("sampling_required", e.target.value)} className={input}><option value="yes">Yes</option><option value="no">No</option></select></div>
        <div><label className={label}>Sample Target Date {form.sampling_required === "yes" ? "*" : ""}</label><input type="date" disabled={form.sampling_required !== "yes"} value={form.sample_target_date} onChange={(e) => update("sample_target_date", e.target.value)} className={input + " disabled:bg-slate-100"} /></div>
        <div><label className={label}>Cost Target Date *</label><input type="date" required value={form.cost_target_date} onChange={(e) => update("cost_target_date", e.target.value)} className={input} /></div>

        <div className="md:col-span-2 bg-mirada-purple/5 border border-mirada-purple/20 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Auto-assigned Designer</span>
            {isAdmin && matched && (<label className="text-xs text-slate-600 inline-flex items-center gap-1.5"><input type="checkbox" checked={form.override_designer} onChange={(e)=>update("override_designer", e.target.checked)} />Override</label>)}
          </div>
          {!form.customer_name || !form.product_type ? (
            <div className="text-sm text-slate-500">Pick Customer + Product Type{designerMap.some(r=>r.license_name) ? " + Theme" : ""} to see who gets assigned.</div>
          ) : matched && matchedDesigner ? (
            <div className="text-sm"><span className="font-semibold text-mirada-purple">{matchedDesigner.full_name || matchedDesigner.email}</span><span className="text-xs text-slate-500 ml-2">via rule: {matched.customer_name || "any customer"} Â· {matched.product_type || "any product"}{matched.license_name ? ` Â· ${matched.license_name}` : ""}</span></div>
          ) : (
            <div className="text-sm text-amber-700">No matching rule for {form.customer_name} Â· {form.product_type}{form.theme ? ` Â· ${form.theme}` : ""}. Designer will be unassigned unless you pick one below.{isAdmin && (<span className="text-xs ml-2"><a href="/dashboard/reference/designer-map" className="underline">Manage Designer Map →</a></span>)}</div>
          )}
          {(form.override_designer || (!matched && form.customer_name && form.product_type)) && (
            <div className="mt-3">
              <label className={label}>{form.override_designer ? "Override with:" : "Pick designer manually:"}</label>
              <select value={form.assigned_designer_id} onChange={(e) => update("assigned_designer_id", e.target.value)} className={input}><option value="">Unassigned</option>{designers.map((d) => (<option key={d.id} value={d.id}>{d.full_name || d.email}</option>))}</select>
            </div>
          )}
        </div>

        <div className="md:col-span-2"><label className={label}>Notes</label><textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} className={input} rows={3} /></div>
      </div>

      {error && (<div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>)}

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
        <button type="button" onClick={() => router.push("/dashboard/queries")} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium">Cancel</button>
        <button type="submit" disabled={saving} className="bg-mirada-purple hover:bg-mirada-purple-dark text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50">{saving ? "Creatingâ¦" : "Create Query"}</button>
      </div>
    </form>
  );
}
