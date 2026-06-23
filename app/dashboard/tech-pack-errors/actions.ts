"use server";
import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function reportTPE(input) {
  const s = createServerClient();
  const { error } = await s.from("mirada_tech_pack_errors").insert(input);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/tech-pack-errors"); return { ok: true };
}

export async function resolveTPE(id, notes, userId) {
  const s = createServerClient();
  const { error } = await s.from("mirada_tech_pack_errors").update({ resolved: true, resolved_at: new Date().toISOString(), resolved_by: userId, resolution_notes: notes }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/tech-pack-errors"); return { ok: true };
}
