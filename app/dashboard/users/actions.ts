"use server";
import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateUserRole(id, role) {
  const s = createServerClient();
  const { error } = await s.from("profiles").update({ role }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/users"); return { ok: true };
}
export async function updateUserPrefix(id, prefix) {
  const s = createServerClient();
  const { error } = await s.from("profiles").update({ query_code_prefix: prefix }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/users"); return { ok: true };
}
export async function toggleUserActive(id, active) {
  const s = createServerClient();
  const { error } = await s.from("profiles").update({ active }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/users"); return { ok: true };
}
export async function inviteUser(input) {
  const s = createServerClient();
  const { error } = await s.from("mirada_pending_invites").upsert({
    email: input.email.toLowerCase(),
    full_name: input.full_name || null,
    role: input.role,
    query_code_prefix: input.query_code_prefix || null,
    invited_by: input.invited_by,
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/users"); return { ok: true };
}
export async function cancelInvite(email) {
  const s = createServerClient();
  const { error } = await s.from("mirada_pending_invites").delete().eq("email", email.toLowerCase());
  if (error) return { error: error.message };
  revalidatePath("/dashboard/users"); return { ok: true };
}
export async function deleteUser(id) {
  const s = createServerClient();
  const { error } = await s.rpc("admin_delete_user", { p_user_id: id });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/users"); return { ok: true };
}
