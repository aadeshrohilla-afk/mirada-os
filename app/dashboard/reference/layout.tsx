import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";

const TABS = [
  { href: "/dashboard/reference/customers", label: "Customers" },
  { href: "/dashboard/reference/product-types", label: "Product Types" },
  { href: "/dashboard/reference/themes", label: "Themes" },
  { href: "/dashboard/reference/licenses", label: "Licenses & Royalty" },
  { href: "/dashboard/reference/raw-materials", label: "Raw Materials" },
  { href: "/dashboard/reference/value-add", label: "Value-Add" },
  { href: "/dashboard/reference/process-rates", label: "Process ₹/min" },
  { href: "/dashboard/reference/label-packaging", label: "Label & Packaging" },
  { href: "/dashboard/reference/designer-map", label: "Designer Map" },
  { href: "/dashboard/reference/learning-curve", label: "Learning Curve" },
];

export default async function ReferenceLayout({ children }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/dashboard");

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Reference Data</h1>
      <p className="text-sm text-slate-500 mb-6">Master data feeding all forms across Mirada OS. Admin only.</p>
      <div className="flex flex-wrap gap-1 mb-6 border-b border-slate-200">
        {TABS.map((t) => (
          <Link key={t.href} href={t.href} className="px-3 py-2 text-sm text-slate-600 hover:text-mirada-purple hover:bg-slate-50 border-b-2 border-transparent">{t.label}</Link>
        ))}
      </div>
      {children}
    </div>
  );
}
