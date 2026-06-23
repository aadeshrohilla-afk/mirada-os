import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const s = createServerClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await s.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") redirect("/dashboard");
  const { data: settings } = await s.from("mirada_settings").select("*");
  return <SettingsClient settings={settings || []} />;
}
