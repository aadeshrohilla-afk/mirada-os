"use server";
import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateSetting(key, value) {
  const s = createServerClient();
  const { error } = await s.from("mirada_settings").upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings");
  return { ok: true };
}
