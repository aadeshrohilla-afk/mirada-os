"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();
  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }
  return (<button onClick={signOut} className="text-sm text-slate-600 hover:text-mirada-purple px-3 py-1.5 rounded-lg border border-slate-300 hover:border-mirada-purple transition">Sign out</button>);
}
