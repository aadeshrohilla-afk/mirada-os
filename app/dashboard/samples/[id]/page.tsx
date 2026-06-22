import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import SampleActions from "./SampleActions";

const STATUS_LABELS = { planned: "Planned", in_progress: "In Progress", review_pending: "Review Pending", approved: "Approved", rejected: "Rejected", cancelled: "Cancelled" };

export default async function SampleDetail({ params }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const role = profile?.role;

  const { data: sample } = await supabase.from("mirada_samples")
    .select(`*, query:mirada_queries!mirada_samples_query_id_fkey(id, code, customer_name, item_name, product_type, theme, quantity), designer:profiles!mirada_samples_designer_id_fkey(full_name, email)`)
    .eq("id", params.id).single();
  if (!sample) notFound();

  const isOwnerOrAdmin = sample.designer_id === user.id || role === "admin";

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/dashboard/samples" className="text-sm text-slate-600">&larr; Back</Link>
      <div className="flex items-center justify-between mt-2 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sample · <span className="font-mono text-mirada-purple">{sample.query?.code}</span></h1>
          <p className="text-sm text-slate-500 mt-1">{sample.sample_type} · {sample.query?.customer_name} · {sample.query?.item_name || sample.query?.product_type}</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100">{STATUS_LABELS[sample.status]}</span>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><div className="text-xs text-slate-500">Designer</div><div>{sample.designer?.full_name}</div></div>
          <div><div className="text-xs text-slate-500">Dimension</div><div>{sample.dimension || "—"}</div></div>
          <div><div className="text-xs text-slate-500">Quantity</div><div>{sample.query?.quantity}</div></div>
          <div><div className="text-xs text-slate-500">Theme</div><div>{sample.query?.theme || "—"}</div></div>
        </div>
        {sample.designer_notes && (<div><div className="text-xs text-slate-500 mb-1">Designer notes</div><div className="text-sm whitespace-pre-wrap">{sample.designer_notes}</div></div>)}
        {sample.customer_feedback && (<div><div className="text-xs text-slate-500 mb-1">Customer feedback</div><div className="text-sm whitespace-pre-wrap">{sample.customer_feedback}</div></div>)}
        {sample.review_notes && (<div><div className="text-xs text-slate-500 mb-1">Review notes</div><div className="text-sm whitespace-pre-wrap">{sample.review_notes}</div></div>)}
      </div>
      {isOwnerOrAdmin && sample.status !== "approved" && sample.status !== "cancelled" && (
        <SampleActions sampleId={sample.id} currentStatus={sample.status} />
      )}
    </div>
  );
}
