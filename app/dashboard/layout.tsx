import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  merchandiser: "Merchandiser",
  designer: "Designer",
  rd_executive: "R&D Executive",
  embroidery_executive: "Embroidery Executive",
  management: "Management",
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-mirada-purple text-white flex items-center justify-center font-bold">M</div>
            <div>
              <div className="text-sm font-bold text-slate-900 leading-none">Mirada OS</div>
              <div className="text-xs text-slate-500 leading-none mt-0.5">Promise Portal &amp; Design Room</div>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium text-slate-900">{profile?.full_name || user.email}</div>
              <div className="text-xs text-slate-500">{user.email} · {profile?.role ? ROLE_LABELS[profile.role] : "—"}</div>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">{children}</main>
    </div>
  );
}
