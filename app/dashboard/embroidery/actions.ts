"use server";
import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addEmbRate(input) {
  const s = createServerClient();
  // Mark previous active rates inactive
  await s.from("mirada_embroidery_rates").update({ active: false }).eq("active", true);
  const { error } = await s.from("mirada_embroidery_rates").insert({ ...input, active: true });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/embroidery"); return { ok: true };
}
export async function deactivateEmbRate(id) {
  const s = createServerClient();
  const { error } = await s.from("mirada_embroidery_rates").update({ active: false }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/embroidery"); return { ok: true };
}
