"use server";
import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function rev() { revalidatePath("/dashboard/reference", "layout"); }

// Simple name+active tables
export async function addSimple(table, name) {
  const s = createServerClient();
  const { error } = await s.from(table).insert({ name });
  if (error) return { error: error.message };
  rev(); return { ok: true };
}
export async function deleteSimple(table, id) {
  const s = createServerClient();
  const { error } = await s.from(table).delete().eq("id", id);
  if (error) return { error: error.message };
  rev(); return { ok: true };
}
export async function toggleSimple(table, id, active) {
  const s = createServerClient();
  const { error } = await s.from(table).update({ active }).eq("id", id);
  if (error) return { error: error.message };
  rev(); return { ok: true };
}

// Licenses
export async function addLicense(name, licensor) {
  const s = createServerClient();
  const { error } = await s.from("licenses").insert({ name, licensor: licensor || null });
  if (error) return { error: error.message };
  rev(); return { ok: true };
}
export async function deleteLicense(id) {
  const s = createServerClient();
  const { error } = await s.from("licenses").delete().eq("id", id);
  if (error) return { error: error.message };
  rev(); return { ok: true };
}
export async function toggleLicenseActive(id, active) {
  const s = createServerClient();
  const { error } = await s.from("licenses").update({ active }).eq("id", id);
  if (error) return { error: error.message };
  rev(); return { ok: true };
}
export async function addRoyalty(license_name, royalty_pct) {
  const s = createServerClient();
  const { error } = await s.from("royalty_rates").insert({ license_name, royalty_pct, effective_from: new Date().toISOString() });
  if (error) return { error: error.message };
  rev(); return { ok: true };
}
export async function deleteRoyalty(id) {
  const s = createServerClient();
  const { error } = await s.from("royalty_rates").delete().eq("id", id);
  if (error) return { error: error.message };
  rev(); return { ok: true };
}

// Raw materials
export async function addRawMaterial(input) {
  const s = createServerClient();
  const { error } = await s.from("raw_material_rates").insert({ ...input, effective_from: new Date().toISOString() });
  if (error) return { error: error.message };
  rev(); return { ok: true };
}
export async function deleteRawMaterial(id) {
  const s = createServerClient();
  const { error } = await s.from("raw_material_rates").delete().eq("id", id);
  if (error) return { error: error.message };
  rev(); return { ok: true };
}

// Process rates
export async function addProcessRate(operation, rate_per_minute) {
  const s = createServerClient();
  const { error } = await s.from("process_minute_rates").insert({ operation, rate_per_minute, effective_from: new Date().toISOString() });
  if (error) return { error: error.message };
  rev(); return { ok: true };
}
export async function deleteProcessRate(id) {
  const s = createServerClient();
  const { error } = await s.from("process_minute_rates").delete().eq("id", id);
  if (error) return { error: error.message };
  rev(); return { ok: true };
}

// Label
export async function addLabel(label_type, hang_tag_gsm, rate_per_piece) {
  const s = createServerClient();
  const { error } = await s.from("label_rates").insert({ label_type, hang_tag_gsm: hang_tag_gsm || null, rate_per_piece, effective_from: new Date().toISOString() });
  if (error) return { error: error.message };
  rev(); return { ok: true };
}
export async function deleteLabel(id) {
  const s = createServerClient();
  const { error } = await s.from("label_rates").delete().eq("id", id);
  if (error) return { error: error.message };
  rev(); return { ok: true };
}
export async function addPackaging(input) {
  const s = createServerClient();
  const { error } = await s.from("packaging_rates").insert({ ...input, effective_from: new Date().toISOString() });
  if (error) return { error: error.message };
  rev(); return { ok: true };
}
export async function deletePackaging(id) {
  const s = createServerClient();
  const { error } = await s.from("packaging_rates").delete().eq("id", id);
  if (error) return { error: error.message };
  rev(); return { ok: true };
}

// Designer Map
export async function addDesignerMap(input) {
  const s = createServerClient();
  const { error } = await s.from("designer_map").insert(input);
  if (error) return { error: error.message };
  rev(); return { ok: true };
}
export async function deleteDesignerMap(id) {
  const s = createServerClient();
  const { error } = await s.from("designer_map").delete().eq("id", id);
  if (error) return { error: error.message };
  rev(); return { ok: true };
}

// Learning curve
export async function upsertLearningCurve(input) {
  const s = createServerClient();
  const { error } = await s.from("learning_curve").upsert(input, { onConflict: "qty_bucket" });
  if (error) return { error: error.message };
  rev(); return { ok: true };
}
export async function deleteLearningCurve(qty_bucket) {
  const s = createServerClient();
  const { error } = await s.from("learning_curve").delete().eq("qty_bucket", qty_bucket);
  if (error) return { error: error.message };
  rev(); return { ok: true };
}
