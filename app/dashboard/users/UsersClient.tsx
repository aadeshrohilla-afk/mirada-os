"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateUserRole, updateUserPrefix, toggleUserActive, inviteUser, cancelInvite } from "./actions";

const ROLES = [{v:"admin",l:"Admin"},{v:"merchandiser",l:"Merchandiser"},{v:"designer",l:"Designer"},{v:"rd_executive",l:"R&D Executive"},{v:"embroidery_executive",l:"Embroidery Executive"},{v:"management",l:"Management"}];

export default function UsersClient({ users, invites, currentUserId }) {
  const router = useRouter();
  const [err, setErr] = useState(null);
  const [showInvite, setShowInvite] = useState(false);
  const [invite, setInvite] = useState({ email: "", full_name: "", role: "merchandiser", query_code_prefix: "" });

  async function setRole(id, role) { const r = await updateUserRole(id, role || null); if (r.error) return setErr(r.error); router.refresh(); }
  async function setPrefix(id, prefix) { const r = await updateUserPrefix(id, prefix.toUpperCase()); if (r.error) return setErr(r.error); router.refresh(); }
  async function toggleActive(id, active) { const r = await toggleUserActive(id, active); if (r.error) return setErr(r.error); router.refresh(); }

  async function submitInvite(e) {
    e.preventDefault(); setErr(null);
    if (!invite.email || !invite.role) return setErr("Email and role are required.");
    const r = await inviteUser({ ...invite, invited_by: currentUserId, query_code_prefix: invite.query_code_prefix.toUpperCase() });
    if (r.error) return setErr(r.error);
    setInvite({ email: "", full_name: "", role: "merchandiser", query_code_prefix: "" });
    setShowInvite(false);
    router.refresh();
  }

  async function dropInvite(email) {
    if (!confirm("Cancel this invite?")) return;
    const r = await cancelInvite(email);
    if (r.error) return setErr(r.error);
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Users & Roles</h1>
        <button onClick={()=>setShowInvite(!showInvite)} className="bg-mirada-purple text-white px-4 py-2 rounded-lg text-sm font-medium">{showInvite ? "Cancel" : "+ Invite User"}</button>
      </div>

      {showInvite && (
        <form onSubmit={submitInvite} className="bg-white rounded-xl border border-slate-200 p-5 mb-6 grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div><label className="block text-xs font-medium mb-1">Email *</label><input type="email" required value={invite.email} onChange={(e)=>setInvite({...invite, email: e.target.value})} placeholder="name@stringsmarketing.in" className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" /></div>
          <div><label className="block text-xs font-medium mb-1">Name</label><input value={invite.full_name} onChange={(e)=>setInvite({...invite, full_name: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" /></div>
          <div><label className="block text-xs font-medium mb-1">Role *</label><select required value={invite.role} onChange={(e)=>setInvite({...invite, role: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm">{ROLES.map(r=>(<option key={r.v} value={r.v}>{r.l}</option>))}</select></div>
          <div><label className="block text-xs font-medium mb-1">Prefix</label><input value={invite.query_code_prefix} onChange={(e)=>setInvite({...invite, query_code_prefix: e.target.value})} maxLength={4} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono uppercase" /></div>
          <button type="submit" className="bg-mirada-purple text-white px-4 py-2 rounded-lg text-sm font-medium">Send Invite</button>
          <p className="md:col-span-5 text-xs text-slate-500">Person signs in at <code>mirada-os.netlify.app/login</code> with their Google account on first use; their role + prefix will apply automatically.</p>
        </form>
      )}

      {err && (<div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">{err}</div>)}

      {invites.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
          <div className="text-sm font-semibold text-amber-900 mb-2">Pending Invites ({invites.length})</div>
          <div className="space-y-1">
            {invites.map(i => (
              <div key={i.email} className="flex items-center justify-between text-sm bg-white rounded p-2 border border-amber-100">
                <div>
                  <span className="font-medium">{i.email}</span>
                  <span className="ml-2 text-xs text-slate-500">{i.full_name && `${i.full_name} · `}{i.role}{i.query_code_prefix && ` · ${i.query_code_prefix}`}</span>
                </div>
                <button onClick={()=>dropInvite(i.email)} className="text-xs text-red-600 hover:underline">Cancel</button>
              </div>
            ))}
          </div>
        </div>
      )}

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
                <td className="px-4 py-3"><select defaultValue={u.role || ""} onChange={(e)=>setRole(u.id, e.target.value)} className="px-2 py-1 rounded border border-slate-300 text-xs"><option value="">(none)</option>{ROLES.map((r)=>(<option key={r.v} value={r.v}>{r.l}</option>))}</select></td>
                <td className="px-4 py-3"><input defaultValue={u.query_code_prefix || ""} onBlur={(e)=>setPrefix(u.id, e.target.value)} maxLength={4} className="px-2 py-1 rounded border border-slate-300 text-xs font-mono w-16 uppercase" /></td>
                <td className="px-4 py-3"><label className="inline-flex items-center gap-2 text-xs"><input type="checkbox" defaultChecked={u.active} onChange={(e)=>toggleActive(u.id, e.target.checked)} />{u.active ? "Active" : "Inactive"}</label></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
