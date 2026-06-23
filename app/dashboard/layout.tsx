import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";

const ROLE_LABELS = { admin: "Admin", merchandiser: "Merchandiser", designer: "Designer", rd_executive: "R&D Executive", embroidery_executive: "Embroidery Executive", management: "Management" };

export default async function DashboardLayout({ children }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).single();
  const role = profile?.role;

  const navLinks = [
    { href: "/dashboard/queries", label: "Queries", show: true },
    { href: "/dashboard/samples", label: "Samples", show: ["admin","designer","management","merchandiser"].includes(role) },
    { href: "/dashboard/cost-sheets", label: "Cost Sheets", show: ["admin","rd_executive","merchandiser","management"].includes(role) },
    { href: "/dashboard/approved-costs", label: "Approved Costs", show: ["admin","merchandiser","management"].includes(role) },
    { href: "/dashboard/pcm", label: "PCM", show: ["admin","rd_executive","embroidery_executive","management"].includes(role) },
    { href: "/dashboard/embroidery", label: "Embroidery Rates", show: ["admin","embroidery_executive"].includes(role) },
    { href: "/dashboard/tech-pack-errors", label: "Tech Pack Errors", show: true },
    { href: "/dashboard/designer-requests", label: "Designer Requests", show: ["admin","designer","merchandiser","rd_executive"].includes(role) },
    { href: "/dashboard/reference", label: "Reference Data", show: role === "admin" },
    { href: "/dashboard/users", label: "Users", show: role === "admin" },
    { href: "/dashboard/settings", label: "Settings", show: role === "admin" },
    { href: "/dashboard/audit", label: "Audit", show: role === "admin" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-mirada-purple text-white flex items-center justify-center font-bold">M</div>
            <div><div className="text-sm font-bold leading-none">Mirada OS</div><div className="text-xs text-slate-500 leading-none mt-0.5">Promise Portal &amp; Design Room</div></div>
          </Link>
          <nav className="hidden md:flex items-center gap-1 flex-1 mx-4 flex-wrap">
            {navLinks.filter(l=>l.show).map(l => (<Link key={l.href} href={l.href} className="text-xs text-slate-600 hover:text-mirada-purple px-2 py-1.5 rounded hover:bg-slate-50">{l.label}</Link>))}
          </nav>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block"><div className="text-sm font-medium">{profile?.full_name || user.email}</div><div className="text-xs text-slate-500">{role ? ROLE_LABELS[role] || role : ""}</div></div>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">{children}</main>
    </div>
  );
}
