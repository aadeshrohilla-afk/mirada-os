"use server";
import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addVA(input) {
  const s = createServerClient();
  const { error } = await s.from("mirada_value_add_rates").insert(input);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/reference/value-add"); return { ok: true };
}
export async function deleteVA(id) {
  const s = createServerClient();
  const { error } = await s.from("mirada_value_add_rates").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/reference/value-add"); return { ok: true };
}
export async function toggleVA(id, active) {
  const s = createServerClient();
  const { error } = await s.from("mirada_value_add_rates").update({ active }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/reference/value-add"); return { ok: true };
}
