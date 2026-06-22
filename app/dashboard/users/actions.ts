"use server";
import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateUserRole(id, role) {
  const supabase = createServerClient();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/users");
  return { ok: true };
}

export async function updateUserPrefix(id, prefix) {
  const supabase = createServerClient();
  const { error } = await supabase.from("profiles").update({ query_code_prefix: prefix }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/users");
  return { ok: true };
}

export async function toggleUserActive(id, active) {
  const supabase = createServerClient();
  const { error } = await supabase.from("profiles").update({ active }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/users");
  return { ok: true };
}
