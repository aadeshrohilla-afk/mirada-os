import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import SampleForm from "./SampleForm";

export default async function NewSamplePage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!["designer","admin"].includes(profile?.role)) redirect("/dashboard/samples");

  // Get queries available to plan a sample for
  let q = supabase.from("mirada_queries").select("id, code, customer_name, item_name, product_type, assigned_designer_id").in("status", ["open","in_sampling","sample_approved"]).order("created_at", {ascending:false});
  if (profile?.role === "designer") q = q.eq("assigned_designer_id", user.id);
  const { data: queries } = await q;

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/dashboard/samples" className="text-sm text-slate-600 hover:text-mirada-purple">&larr; Back to samples</Link>
      <h1 className="text-2xl font-bold text-slate-900 mt-2 mb-1">Plan Sample</h1>
      <p className="text-sm text-slate-500 mb-6">Plan a new sample for a query assigned to you.</p>
      <SampleForm currentUserId={user.id} userRole={profile?.role} queries={queries || []} />
    </div>
  );
}
