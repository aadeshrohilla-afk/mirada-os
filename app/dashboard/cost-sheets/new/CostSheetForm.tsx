"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createCostSheet } from "./actions";

const Section = ({ n, title, children }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-5">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-7 h-7 rounded-full bg-mirada-purple text-white text-sm font-bold flex items-center justify-center">{n}</div>
      <h2 className="text-base font-semibold text-slate-800">{title}</h2>
    </div>
    {children}
  </div>
);

export default function CostSheetForm({ currentUserId, queries, defaults, pcm, rawMaterials, valueAdd, labels, packaging, processRates, embroidery }) {
  const router = useRouter();
  const [query_id, setQueryId] = useState("");
  const selectedQuery = queries.find(q => q.id === query_id);
  const qty = selectedQuery?.quantity || 1;
  const productType = selectedQuery?.product_type;

  // P1 Process: line items {process_name, sams, rate, cost}
  const [processItems, setProcessItems] = useState([{ name: "", sams: "", rate: "" }]);
  // P2 Raw Materials: {material, qty, rate}
  const [matItems, setMatItems] = useState([{ material: "", qty: "", rate: "" }]);
  // P3 Value-Add: {name, qty, rate}
  const [vaItems, setVAItems] = useState([{ name: "", qty: "", rate: "" }]);
  // P4 Label & Packaging: {kind, name, qty, rate}
  const [lpItems, setLPItems] = useState([{ kind: "Label", name: "", qty: "", rate: "" }]);
  // Embroidery
  const [embStitches, setEmbStitches] = useState("");
  const [embRate, setEmbRate] = useState("");
  // OH/Profit/Royalty
  const [oh, setOH] = useState(String(defaults.overhead_pct));
  const [profit, setProfit] = useState(String(defaults.profit_pct));
  const [royalty, setRoyalty] = useState(String(defaults.royalty_pct));
  const [notes, setNotes] = useState("");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // PCM auto-suggest for current product type
  const pcmForProduct = useMemo(() => pcm.filter(p => p.product_type === productType), [pcm, productType]);

  function autoFillProcess() {
    if (pcmForProduct.length > 0) {
      setProcessItems(pcmForProduct.map(p => ({ name: p.process_name, sams: String(p.sams_per_op), rate: String(p.rate_per_min) })));
    }
  }

  const calc = useMemo(() => {
    const processCost = processItems.reduce((s, i) => s + (Number(i.sams)||0) * (Number(i.rate)||0), 0);
    const matCost = matItems.reduce((s, i) => s + (Number(i.qty)||0) * (Number(i.rate)||0), 0);
    const vaCost = vaItems.reduce((s, i) => s + (Number(i.qty)||0) * (Number(i.rate)||0), 0);
    const labelCost = lpItems.filter(i=>i.kind==='Label').reduce((s, i) => s + (Number(i.qty)||0) * (Number(i.rate)||0), 0);
    const pkgCost = lpItems.filter(i=>i.kind==='Packaging').reduce((s, i) => s + (Number(i.qty)||0) * (Number(i.rate)||0), 0);
    const embCost = (Number(embStitches)||0) * (Number(embRate)||0);
    const p1 = processCost;
    const p2 = matCost;
    const p3 = vaCost + embCost;
    const p4 = labelCost + pkgCost;
    const subtotal = p1 + p2 + p3 + p4;
    const oh_amt = subtotal * (Number(oh)||0) / 100;
    const profit_amt = (subtotal + oh_amt) * (Number(profit)||0) / 100;
    const royalty_amt = (subtotal + oh_amt + profit_amt) * (Number(royalty)||0) / 100;
    const total = subtotal + oh_amt + profit_amt + royalty_amt;
    const per_piece = qty > 0 ? total / qty : 0;
    return { p1, p2, p3, p4, subtotal, oh_amt, profit_amt, royalty_amt, total, per_piece, processCost, matCost, vaCost, labelCost, pkgCost, embCost };
  }, [processItems, matItems, vaItems, lpItems, embStitches, embRate, oh, profit, royalty, qty]);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!query_id) return setError("Select a query.");
    setSaving(true);
    const r = await createCostSheet({
      query_id, prepared_by: currentUserId,
      rate_per_min: 0, total_minutes: 0,
      process_cost: calc.p1, material_cost: calc.p2, value_add_cost: calc.vaCost,
      embroidery_cost: calc.embCost, label_cost: calc.labelCost, packaging_cost: calc.pkgCost,
      overhead_pct: Number(oh)||0, profit_pct: Number(profit)||0, royalty_pct: Number(royalty)||0,
      subtotal: calc.subtotal, oh_amt: calc.oh_amt, profit_amt: calc.profit_amt, royalty_amt: calc.royalty_amt,
      target_cost: calc.total, per_piece: calc.per_piece,
      line_items_json: { p1_process: processItems, p2_materials: matItems, p3_value_add: vaItems, p3_embroidery: { stitches: embStitches, rate: embRate }, p4_label_pack: lpItems },
      notes: notes || null,
    });
    setSaving(false);
    if (r.error) return setError(r.error);
    router.push("/dashboard/cost-sheets");
    router.refresh();
  }

  const inp = "px-3 py-2 rounded-lg border border-slate-300 text-sm w-full";
  const lbl = "block text-xs font-medium text-slate-700 mb-1";

  function LineTable({ items, setItems, columns, addLabel }) {
    return (
      <div className="space-y-2">
        <div className="grid gap-2" style={{gridTemplateColumns: `repeat(${columns.length}, minmax(0,1fr)) auto`}}>
          {columns.map(c => (<div key={c.key} className="text-xs font-semibold text-slate-600">{c.label}</div>))}
          <div></div>
          {items.map((row, idx) => (
            <FragmentRow key={idx} row={row} columns={columns} idx={idx} setItems={setItems} items={items} />
          ))}
        </div>
        <button type="button" onClick={()=>setItems([...items, columns.reduce((o,c)=>({...o,[c.key]: c.default||""}), {})])} className="text-xs text-mirada-purple hover:underline">+ Add {addLabel}</button>
      </div>
    );
  }
  function FragmentRow({ row, columns, idx, setItems, items }) {
    return (<>
      {columns.map(c => (
        c.options ? (
          <select key={c.key} value={row[c.key]||""} onChange={(e)=>{ const next=[...items]; next[idx]={...row,[c.key]:e.target.value}; setItems(next); }} className={inp}>
            <option value="">{c.placeholder||""}</option>
            {c.options.map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}
          </select>
        ) : (
          <input key={c.key} type={c.type||"text"} step={c.step} value={row[c.key]||""} onChange={(e)=>{ const next=[...items]; next[idx]={...row,[c.key]:e.target.value}; setItems(next); }} placeholder={c.placeholder} className={inp} />
        )
      ))}
      <button type="button" onClick={()=>setItems(items.filter((_,i)=>i!==idx))} className="text-red-600 text-sm">×</button>
    </>);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Section n={0} title="Query">
        <select required value={query_id} onChange={(e)=>setQueryId(e.target.value)} className={inp}>
          <option value="">Select query…</option>
          {queries.map((q)=>(<option key={q.id} value={q.id}>{q.code} · {q.customer_name} · {q.item_name || q.product_type} · {q.quantity} units</option>))}
        </select>
      </Section>

      <Section n={1} title={`Process Cost · ₹${calc.p1.toFixed(2)}`}>
        <div className="flex justify-between items-center mb-2"><span className="text-xs text-slate-500">SAMs × Rate per min for each operation</span>{pcmForProduct.length > 0 && (<button type="button" onClick={autoFillProcess} className="text-xs text-mirada-purple underline">Auto-fill from PCM ({pcmForProduct.length} entries for {productType})</button>)}</div>
        <LineTable items={processItems} setItems={setProcessItems} addLabel="operation" columns={[
          { key: "name", label: "Operation", placeholder: "e.g. Stitching", options: processRates.length ? [...new Set(pcm.map(p=>p.process_name).concat(processRates.map(r=>r.operation)))].map(n=>({value:n,label:n})) : null },
          { key: "sams", label: "SAMs/op", type: "number", step: "0.001", placeholder: "0.0" },
          { key: "rate", label: "Rate ₹/min", type: "number", step: "0.01", placeholder: "0.0" },
        ]} />
      </Section>

      <Section n={2} title={`Raw Materials · ₹${calc.p2.toFixed(2)}`}>
        <LineTable items={matItems} setItems={setMatItems} addLabel="material" columns={[
          { key: "material", label: "Material", placeholder: "e.g. PV Fabric", options: rawMaterials.length ? rawMaterials.map(r=>({value:r.material, label:`${r.material} (${r.category})`})) : null },
          { key: "qty", label: "Qty", type: "number", step: "0.01", placeholder: "0" },
          { key: "rate", label: "Rate ₹/unit", type: "number", step: "0.01", placeholder: "0" },
        ]} />
      </Section>

      <Section n={3} title={`Value-Add · ₹${calc.p3.toFixed(2)}`}>
        <div className="text-xs text-slate-500 mb-2">Includes Print/Sublimation/Heat Transfer + Embroidery</div>
        <div className="mb-3">
          <div className="text-xs font-semibold text-slate-600 mb-1">Embroidery</div>
          <div className="grid grid-cols-3 gap-2">
            <input type="number" placeholder="Stitches" value={embStitches} onChange={(e)=>setEmbStitches(e.target.value)} className={inp} />
            <select value={embRate} onChange={(e)=>setEmbRate(e.target.value)} className={inp}><option value="">Rate per stitch</option>{embroidery.map(er=>(<option key={er.id} value={er.rate_per_stitch}>₹{er.rate_per_stitch} (min ₹{er.min_charge_per_piece}/pc)</option>))}</select>
            <div className="px-3 py-2 text-sm tabular-nums">= ₹{calc.embCost.toFixed(2)}</div>
          </div>
        </div>
        <div className="text-xs font-semibold text-slate-600 mb-1">Other Value-Add</div>
        <LineTable items={vaItems} setItems={setVAItems} addLabel="value-add" columns={[
          { key: "name", label: "Type", options: valueAdd.map(v=>({value:v.name, label:`${v.name} (₹${v.rate_per_unit}/${v.unit})`})) },
          { key: "qty", label: "Qty", type: "number", step: "0.01", placeholder: "0" },
          { key: "rate", label: "Rate ₹", type: "number", step: "0.01", placeholder: "0" },
        ]} />
      </Section>

      <Section n={4} title={`Label & Packaging · ₹${calc.p4.toFixed(2)}`}>
        <LineTable items={lpItems} setItems={setLPItems} addLabel="item" columns={[
          { key: "kind", label: "Kind", default: "Label", options: [{value:"Label",label:"Label"},{value:"Packaging",label:"Packaging"}] },
          { key: "name", label: "Type / Spec", placeholder: "e.g. Hang Tag 250 GSM" },
          { key: "qty", label: "Qty", type: "number", step: "0.01", placeholder: "1" },
          { key: "rate", label: "Rate ₹", type: "number", step: "0.01", placeholder: "0" },
        ]} />
      </Section>

      <Section n={5} title="Overhead / Profit / Royalty">
        <div className="grid grid-cols-3 gap-4">
          <div><label className={lbl}>Overhead %</label><input type="number" step="0.1" value={oh} onChange={(e)=>setOH(e.target.value)} className={inp} /></div>
          <div><label className={lbl}>Profit %</label><input type="number" step="0.1" value={profit} onChange={(e)=>setProfit(e.target.value)} className={inp} /></div>
          <div><label className={lbl}>Royalty %</label><input type="number" step="0.1" value={royalty} onChange={(e)=>setRoyalty(e.target.value)} className={inp} /></div>
        </div>
      </Section>

      <div className="bg-mirada-purple/5 rounded-xl border-2 border-mirada-purple p-5">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
          <div><div className="text-xs text-slate-600">Subtotal</div><div className="font-semibold tabular-nums">₹{calc.subtotal.toFixed(2)}</div></div>
          <div><div className="text-xs text-slate-600">+ Overhead</div><div className="font-semibold tabular-nums">₹{calc.oh_amt.toFixed(2)}</div></div>
          <div><div className="text-xs text-slate-600">+ Profit</div><div className="font-semibold tabular-nums">₹{calc.profit_amt.toFixed(2)}</div></div>
          <div><div className="text-xs text-slate-600">+ Royalty</div><div className="font-semibold tabular-nums">₹{calc.royalty_amt.toFixed(2)}</div></div>
          <div><div className="text-xs text-slate-600">Target Total</div><div className="text-2xl font-bold text-mirada-purple tabular-nums">₹{calc.total.toFixed(2)}</div></div>
        </div>
        <div className="mt-3 pt-3 border-t border-mirada-purple/30 text-sm">
          <span className="text-xs text-slate-600">Per piece (÷ {qty} units): </span>
          <span className="text-lg font-bold text-mirada-purple tabular-nums">₹{calc.per_piece.toFixed(2)}</span>
        </div>
      </div>

      <Section n={6} title="Notes (optional)">
        <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} rows={3} className={inp} />
      </Section>

      {error && (<div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>)}
      <div className="flex justify-end gap-3">
        <button type="button" onClick={()=>router.push("/dashboard/cost-sheets")} className="px-4 py-2 rounded-lg border border-slate-300 text-sm">Cancel</button>
        <button type="submit" disabled={saving} className="bg-mirada-purple text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50">{saving ? "Saving…" : "Create Cost Sheet"}</button>
      </div>
    </form>
  );
}
