import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

export default async function ReferenceLayout({ children }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/dashboard/queries");
  return <>{children}</>;
}
