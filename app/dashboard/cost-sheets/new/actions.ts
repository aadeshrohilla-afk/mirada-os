"use server";
import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCostSheet(input) {
  const supabase = createServerClient();
  const { error } = await supabase.from("mirada_cost_sheets").insert(input);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/cost-sheets");
  return { ok: true };
}

export async function updateCostSheetStatus(id, status, approvedCost) {
  const supabase = createServerClient();
  const update = { status };
  if (typeof approvedCost === "number") update.approved_cost = approvedCost;
  const { error } = await supabase.from("mirada_cost_sheets").update(update).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/cost-sheets");
  revalidatePath(`/dashboard/cost-sheets/${id}`);
  return { ok: true };
}
