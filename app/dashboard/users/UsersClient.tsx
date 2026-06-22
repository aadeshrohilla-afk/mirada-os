"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateUserRole, updateUserPrefix, toggleUserActive } from "./actions";

const ROLES = [{v:"admin",l:"Admin"},{v:"merchandiser",l:"Merchandiser"},{v:"designer",l:"Designer"},{v:"rd_executive",l:"R&D Executive"},{v:"embroidery_executive",l:"Embroidery Executive"},{v:"management",l:"Management"}];

export default function UsersClient({ users }) {
  const router = useRouter();
  const [err, setErr] = useState(null);

  async function setRole(id, role) {
    const r = await updateUserRole(id, role || null); if (r.error) return setErr(r.error);
    router.refresh();
  }
  async function setPrefix(id, prefix) {
    const r = await updateUserPrefix(id, prefix.toUpperCase()); if (r.error) return setErr(r.error);
    router.refresh();
  }
  async function toggleActive(id, active) {
    const r = await toggleUserActive(id, active); if (r.error) return setErr(r.error);
    router.refresh();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Users & Roles</h1>
      {err && (<div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">{err}</div>)}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-700">
            <tr><th className="text-left px-4 py-3">Email</th><th className="text-left px-4 py-3">Name</th><th className="text-left px-4 py-3">Role</th><th className="text-left px-4 py-3">Prefix</th><th className="text-left px-4 py-3">Active</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="px-4 py-3 text-xs">{u.email}</td>
                <td className="px-4 py-3">{u.full_name || "—"}</td>
                <td className="px-4 py-3">
                  <select defaultValue={u.role || ""} onChange={(e)=>setRole(u.id, e.target.value)} className="px-2 py-1 rounded border border-slate-300 text-xs">
                    <option value="">(none)</option>
                    {ROLES.map((r)=>(<option key={r.v} value={r.v}>{r.l}</option>))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <input defaultValue={u.query_code_prefix || ""} onBlur={(e)=>setPrefix(u.id, e.target.value)} maxLength={4} className="px-2 py-1 rounded border border-slate-300 text-xs font-mono w-16 uppercase" />
                </td>
                <td className="px-4 py-3">
                  <label className="inline-flex items-center gap-2 text-xs"><input type="checkbox" defaultChecked={u.active} onChange={(e)=>toggleActive(u.id, e.target.checked)} />{u.active ? "Active" : "Inactive"}</label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
