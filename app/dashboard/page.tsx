import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

const ROLE_ROUTES = {
  admin: "/dashboard/admin",
  merchandiser: "/dashboard/merchandiser",
  designer: "/dashboard/designer",
  rd_executive: "/dashboard/rd_executive",
  embroidery_executive: "/dashboard/embroidery_executive",
  management: "/dashboard/management",
};

export default async function DashboardIndex() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const target = profile?.role ? ROLE_ROUTES[profile.role] : null;
  if (target) redirect(target);

  return null;
}
