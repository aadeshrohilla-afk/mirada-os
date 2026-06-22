import { createServerClient } from "@/lib/supabase/server";
import LearningCurveClient from "./LearningCurveClient";

export default async function LearningCurveTab() {
  const s = createServerClient();
  const { data: rows } = await s.from("learning_curve").select("*").order("qty_bucket");
  return <LearningCurveClient rows={rows || []} />;
}
