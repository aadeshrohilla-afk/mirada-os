"use server";
import { createServerClient } from "@/lib/supabase/server";

export async function createQuery(input) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  // Get the merchandiser's prefix for the code
  const { data: merchProfile } = await supabase
    .from("profiles")
    .select("query_code_prefix")
    .eq("id", input.merchandiser_id)
    .single();

  const prefix = (merchProfile?.query_code_prefix || "ZZ").toUpperCase();

  // Generate code via RPC
  const { data: code, error: codeErr } = await supabase.rpc("mirada_next_query_code", { p_prefix: prefix });
  if (codeErr) return { error: "Could not generate code: " + codeErr.message };

  const { error } = await supabase.from("mirada_queries").insert({
    code,
    merchandiser_id: input.merchandiser_id,
    customer_name: input.customer_name,
    product_type: input.product_type,
    theme: input.theme,
    item_name: input.item_name,
    quantity: input.quantity,
    sampling_required: input.sampling_required,
    sample_target_date: input.sample_target_date,
    cost_target_date: input.cost_target_date,
    assigned_designer_id: input.assigned_designer_id,
    notes: input.notes,
    status: "open",
  });

  if (error) return { error: error.message };
  return { ok: true, code };
}
