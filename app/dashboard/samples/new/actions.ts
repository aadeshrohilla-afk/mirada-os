"use server";
import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createSample(input) {
  const supabase = createServerClient();
  const { error } = await supabase.from("mirada_samples").insert({
    query_id: input.query_id, designer_id: input.designer_id,
    sample_type: input.sample_type, dimension: input.dimension || null,
    designer_notes: input.designer_notes || null, status: "planned",
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/samples");
  return { ok: true };
}

export async function updateSampleStatus(sampleId, status, extras) {
  const supabase = createServerClient();
  const update = { status, ...extras };
  const { error } = await supabase.from("mirada_samples").update(update).eq("id", sampleId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/samples");
  revalidatePath(`/dashboard/samples/${sampleId}`);
  return { ok: true };
}
