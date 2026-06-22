"use server";
import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addPCM(input) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from("mirada_pcm").insert({ ...input, created_by: user?.id });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/pcm");
  return { ok: true };
}

export async function updatePCM(id, input) {
  const supabase = createServerClient();
  const { error } = await supabase.from("mirada_pcm").update(input).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/pcm");
  return { ok: true };
}

export async function deletePCM(id) {
  const supabase = createServerClient();
  const { error } = await supabase.from("mirada_pcm").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/pcm");
  return { ok: true };
}
