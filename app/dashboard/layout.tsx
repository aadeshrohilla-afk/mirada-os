import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";

const ROLE_LABELS = { admin: "Admin", merchandiser: "Merchandiser", designer: "Designer", rd_executive: "R&D Executive", embroidery_executive: "Embroidery Executive", management: "Management" };
const VIEW_LABEL = { admin: "Admin — Full Access", merchandiser: "Merchandiser — My Queries & Costs", designer: "Designer — My Samples", rd_executive: "R&D — Costing & PCM", embroidery_executive: "Embroidery — Rates", management: "Management — Read-only View" };

const NAV = [
  { group: "Workflow", items: [
    { href: "/dashboard/queries", icon: "🗂️", label: "Queries", roles: ["admin","merchandiser","designer","management","rd_executive","embroidery_executive"] },
    { href: "/dashboard/samples", icon: "🎨", label: "Samples", roles: ["admin","designer","merchandiser","management"] },
    { href: "/dashboard/cost-sheets", icon: "💰", label: "Cost Sheets", roles: ["admin","rd_executive","merchandiser","management"] },
    { href: "/dashboard/approved-costs", icon: "✅", label: "Approved Costs", roles: ["admin","merchandiser","management"] },
  ]},
  { group: "Operations", items: [
    { href: "/dashboard/pcm", icon: "⚙️", label: "Process Cost Master", roles: ["admin","rd_executive","embroidery_executive","management"] },
    { href: "/dashboard/embroidery", icon: "🧵", label: "Embroidery Rates", roles: ["admin","embroidery_executive"] },
    { href: "/dashboard/tech-pack-errors", icon: "⚠️", label: "Tech Pack Errors", roles: ["admin","designer","merchandiser","rd_executive"] },
    { href: "/dashboard/designer-requests", icon: "📥", label: "Designer Requests", roles: ["admin","designer","merchandiser","rd_executive"] },
  ]},
  { group: "Reference Data", items: [
    { href: "/dashboard/reference/customers", icon: "🏢", label: "Customers", roles: ["admin"] },
    { href: "/dashboard/reference/product-types", icon: "📦", label: "Product Types", roles: ["admin"] },
    { href: "/dashboard/reference/themes", icon: "🎭", label: "Themes", roles: ["admin"] },
    { href: "/dashboard/reference/licenses", icon: "📜", label: "Licenses & Royalty", roles: ["admin"] },
    { href: "/dashboard/reference/raw-materials", icon: "🧶", label: "Raw Materials", roles: ["admin"] },
    { href: "/dashboard/reference/value-add", icon: "✨", label: "Value-Add Rates", roles: ["admin"] },
    { href: "/dashboard/reference/process-rates", icon: "⏱️", label: "Process ₹/min", roles: ["admin"] },
    { href: "/dashboard/reference/label-packaging", icon: "🏷️", label: "Label & Packaging", roles: ["admin"] },
    { href: "/dashboard/reference/designer-map", icon: "🗺️", label: "Designer Map", roles: ["admin"] },
    { href: "/dashboard/reference/learning-curve", icon: "📈", label: "Learning Curve", roles: ["admin"] },
  ]},
  { group: "Admin", items: [
    { href: "/dashboard/users", icon: "👥", label: "Users & Roles", roles: ["admin"] },
    { href: "/dashboard/settings", icon: "🛠️", label: "Settings", roles: ["admin"] },
    { href: "/dashboard/audit", icon: "📋", label: "Audit Log", roles: ["admin"] },
  ]},
];

export default async function DashboardLayout({ children }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).single();
  const role = profile?.role;
  const viewLabel = role ? VIEW_LABEL[role] || ROLE_LABELS[role] : "No role assigned";

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-60 shrink-0 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen">
        <Link href="/dashboard" className="flex items-center gap-2 px-4 py-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-lg bg-mirada-purple text-white flex items-center justify-center font-bold">M</div>
          <div className="min-w-0"><div className="text-sm font-bold text-slate-900 leading-tight truncate">Mirada OS</div><div className="text-[10px] text-slate-500 leading-tight uppercase tracking-wider">Promise Portal &amp; Design Room</div></div>
        </Link>
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{role ? ROLE_LABELS[role] : "User"}</div>
          <div className="text-xs text-slate-700 font-medium leading-tight mt-0.5">{viewLabel}</div>
        </div>
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-3">
          {NAV.map(g => {
            const visible = g.items.filter(i => i.roles.includes(role));
            if (visible.length === 0) return null;
            return (<div key={g.group}><div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-2 mb-1">{g.group}</div><div className="space-y-0.5">{visible.map(item => (<Link key={item.href} href={item.href} className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-slate-700 hover:bg-slate-100 hover:text-mirada-purple transition"><span className="text-base leading-none">{item.icon}</span><span className="truncate">{item.label}</span>{role === "management" && (<span className="ml-auto text-[9px] font-bold text-slate-400 bg-slate-100 px-1 py-0.5 rounded">RO</span>)}</Link>))}</div></div>);
          })}
        </nav>
        <div className="border-t border-slate-100 px-4 py-3">
          <div className="text-xs font-medium text-slate-900 truncate">{profile?.full_name || user.email}</div>
          <div className="text-[10px] text-slate-500 truncate">{user.email}</div>
          <div className="mt-2"><SignOutButton /></div>
        </div>
      </aside>
      <main className="flex-1 min-w-0 overflow-x-hidden"><div className="max-w-7xl mx-auto px-6 py-6">{children}</div></main>
    </div>
  );
}
