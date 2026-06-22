"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSampleStatus } from "../new/actions";

export default function SampleActions({ sampleId, currentStatus }) {
  const router = useRouter();
  const [reviewNotes, setReviewNotes] = useState("");
  const [customerFeedback, setCustomerFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function act(status) {
    setBusy(true); setError(null);
    const r = await updateSampleStatus(sampleId, status, { review_notes: reviewNotes || null, customer_feedback: customerFeedback || null, reviewed_at: new Date().toISOString() });
    setBusy(false);
    if (r.error) return setError(r.error);
    router.refresh();
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Review & Update</h2>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Customer Feedback</label>
        <textarea value={customerFeedback} onChange={(e)=>setCustomerFeedback(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" rows={2} placeholder="Customer's feedback on this sample…" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Review Notes</label>
        <textarea value={reviewNotes} onChange={(e)=>setReviewNotes(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" rows={2} />
      </div>
      {error && (<div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>)}
      <div className="flex gap-2 flex-wrap">
        {currentStatus === "planned" && (<button disabled={busy} onClick={()=>act("in_progress")} className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Mark In Progress</button>)}
        {(currentStatus === "in_progress" || currentStatus === "planned") && (<button disabled={busy} onClick={()=>act("review_pending")} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Send for Review</button>)}
        <button disabled={busy} onClick={()=>act("approved")} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Approve</button>
        <button disabled={busy} onClick={()=>act("rejected")} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Reject</button>
        <button disabled={busy} onClick={()=>act("cancelled")} className="bg-slate-500 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Cancel</button>
      </div>
    </div>
  );
}
