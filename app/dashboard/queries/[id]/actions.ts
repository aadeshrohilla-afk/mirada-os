"use server";
import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateQuery(id, input) {
  const supabase = createServerClient();
  const { error } = await supabase.from("mirada_queries").update(input).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/queries");
  revalidatePath(`/dashboard/queries/${id}`);
  return { ok: true };
}

export async function deleteQuery(id) {
  const supabase = createServerClient();
  const { error } = await supabase.from("mirada_queries").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/queries");
  return { ok: true };
}
