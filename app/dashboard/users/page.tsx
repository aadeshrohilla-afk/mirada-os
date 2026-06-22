import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import UsersClient from "./UsersClient";

export default async function UsersPage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") redirect("/dashboard");
  const { data: users } = await supabase.from("profiles").select("id, email, full_name, role, active, query_code_prefix").order("email");
  return <UsersClient users={users || []} />;
}
