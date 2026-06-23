"use server";
import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createDR(input) {
  const s = createServerClient();
  const { error } = await s.from("mirada_designer_requests").insert({ ...input, query_id: input.query_id || null });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/designer-requests"); return { ok: true };
}
export async function resolveDR(id, notes) {
  const s = createServerClient();
  const { error } = await s.from("mirada_designer_requests").update({ resolved: true, resolved_at: new Date().toISOString(), resolution_notes: notes }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/designer-requests"); return { ok: true };
}
