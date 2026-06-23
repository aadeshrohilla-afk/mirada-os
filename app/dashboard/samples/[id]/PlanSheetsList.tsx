"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPlanSheet, updatePlanSheet, deletePlanSheet } from "../new/planSheetActions";

const PLAN_STATUS = { draft: "Draft", submitted: "Submitted", approved: "Approved", revision_requested: "Revision Requested", cancelled: "Cancelled" };

export default function PlanSheetsList({ sampleId, planSheets, canEdit }) {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ dimension: "", designer_notes: "", customer_feedback: "" });
  const [err, setErr] = useState(null);

  async function add(e) {
    e.preventDefault(); setErr(null);
    const r = await createPlanSheet({ sample_id: sampleId, dimension: form.dimension || null, designer_notes: form.designer_notes || null, customer_feedback: form.customer_feedback || null, status: "draft" });
    if (r.error) return setErr(r.error);
    setForm({ dimension: "", designer_notes: "", customer_feedback: "" });
    setShowAdd(false);
    router.refresh();
  }
  async function setStatus(id, status) {
    const patch = { status };
    if (status === "submitted") patch.submitted_at = new Date().toISOString();
    if (status === "approved") patch.approved_at = new Date().toISOString();
    const r = await updatePlanSheet(id, patch);
    if (r.error) return alert(r.error);
    router.refresh();
  }
  async function del(id) {
    if (!confirm("Delete this plan sheet?")) return;
    const r = await deletePlanSheet(id);
    if (r.error) return alert(r.error);
    router.refresh();
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide">Plan Sheets ({planSheets.length})</h2>
        {canEdit && (<button onClick={()=>setShowAdd(!showAdd)} className="text-sm text-mirada-purple hover:underline">{showAdd ? "Cancel" : "+ New Revision"}</button>)}
      </div>
      {showAdd && canEdit && (
        <form onSubmit={add} className="mb-4 space-y-3 border-b border-slate-100 pb-4">
          <input placeholder="Dimension (e.g. 30x40 cm)" value={form.dimension} onChange={(e)=>setForm({...form, dimension: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
          <textarea placeholder="Designer notes" value={form.designer_notes} onChange={(e)=>setForm({...form, designer_notes: e.target.value})} rows={3} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
          <textarea placeholder="Customer feedback (optional)" value={form.customer_feedback} onChange={(e)=>setForm({...form, customer_feedback: e.target.value})} rows={2} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
          {err && (<div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{err}</div>)}
          <button type="submit" className="bg-mirada-purple text-white px-4 py-2 rounded-lg text-sm font-medium">Save Plan Sheet</button>
        </form>
      )}
      {planSheets.length === 0 ? (<div className="text-center text-sm text-slate-500 py-6">No plan sheets yet.</div>) : (
        <div className="space-y-3">
          {planSheets.map((ps) => (
            <div key={ps.id} className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div><span className="font-semibold">Rev #{ps.revision}</span><span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-slate-100">{PLAN_STATUS[ps.status]}</span></div>
                {canEdit && (<div className="flex gap-2 text-xs">
                  {ps.status === "draft" && (<button onClick={()=>setStatus(ps.id, "submitted")} className="text-blue-600 hover:underline">Submit</button>)}
                  {ps.status === "submitted" && (<>
                    <button onClick={()=>setStatus(ps.id, "approved")} className="text-green-600 hover:underline">Approve</button>
                    <button onClick={()=>setStatus(ps.id, "revision_requested")} className="text-amber-600 hover:underline">Request Revision</button>
                  </>)}
                  <button onClick={()=>del(ps.id)} className="text-red-600 hover:underline">Delete</button>
                </div>)}
              </div>
              {ps.dimension && (<div className="text-sm"><span className="text-xs text-slate-500">Dimension: </span>{ps.dimension}</div>)}
              {ps.designer_notes && (<div className="text-sm mt-1 whitespace-pre-wrap"><span className="text-xs text-slate-500">Notes: </span>{ps.designer_notes}</div>)}
              {ps.customer_feedback && (<div className="text-sm mt-1 whitespace-pre-wrap"><span className="text-xs text-slate-500">Feedback: </span>{ps.customer_feedback}</div>)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
