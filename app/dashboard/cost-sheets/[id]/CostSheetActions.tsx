"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateCostSheetStatus } from "../new/actions";

export default function CostSheetActions({ sheetId, currentStatus, targetCost, userRole }) {
  const router = useRouter();
  const [approvedCost, setApprovedCost] = useState(String(targetCost || ""));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function act(status, includeApproved) {
    setBusy(true); setError(null);
    const r = await updateCostSheetStatus(sheetId, status, includeApproved ? Number(approvedCost) : undefined);
    setBusy(false);
    if (r.error) return setError(r.error);
    router.refresh();
  }

  const canSubmit = currentStatus === "draft" && (userRole === "rd_executive" || userRole === "admin");
  const canApprove = currentStatus === "submitted" && (userRole === "admin" || userRole === "merchandiser");

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide">Actions</h2>
      {canApprove && (
        <div>
          <label className="block text-sm font-medium mb-1">Customer-Approved Cost ₹</label>
          <input type="number" step="0.01" value={approvedCost} onChange={(e)=>setApprovedCost(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
        </div>
      )}
      {error && (<div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>)}
      <div className="flex gap-2 flex-wrap">
        {canSubmit && (<button disabled={busy} onClick={()=>act("submitted", false)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Submit for Approval</button>)}
        {canApprove && (<button disabled={busy} onClick={()=>act("approved", true)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Approve</button>)}
        {canApprove && (<button disabled={busy} onClick={()=>act("rejected", false)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Reject</button>)}
        <button disabled={busy} onClick={()=>act("cancelled", false)} className="bg-slate-500 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Cancel</button>
      </div>
    </div>
  );
}
