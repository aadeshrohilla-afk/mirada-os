import Link from "next/link";
export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">R&D Executive Dashboard</h1>
      <p className="text-slate-600 mb-6">Your workflow tools are being built. In the meantime, you can browse customer queries.</p>
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <p className="text-sm text-slate-500 mb-4">Workflow tools coming soon for this role.</p>
        <Link href="/dashboard/queries" className="inline-block bg-mirada-purple hover:bg-mirada-purple-dark text-white px-4 py-2 rounded-lg text-sm font-medium">Browse Queries &rarr;</Link>
      </div>
    </div>
  );
}
