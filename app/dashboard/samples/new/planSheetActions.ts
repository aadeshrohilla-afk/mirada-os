"use server";
import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createPlanSheet(input) {
  const s = createServerClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { data: existing } = await s.from("mirada_plan_sheets").select("revision").eq("sample_id", input.sample_id).order("revision", { ascending: false }).limit(1);
  const nextRev = (existing?.[0]?.revision || 0) + 1;
  const { error } = await s.from("mirada_plan_sheets").insert({ ...input, designer_id: user.id, revision: nextRev });
  if (error) return { error: error.message };
  revalidatePath(`/dashboard/samples/${input.sample_id}`);
  return { ok: true };
}

export async function updatePlanSheet(id, patch) {
  const s = createServerClient();
  const { error } = await s.from("mirada_plan_sheets").update(patch).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/samples");
  return { ok: true };
}

export async function deletePlanSheet(id) {
  const s = createServerClient();
  const { error } = await s.from("mirada_plan_sheets").delete().eq("id", id);
  if (error) return { error: error.message };
  return { ok: true };
}
