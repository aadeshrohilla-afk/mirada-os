import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-mirada-purple-light/30 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-mirada-purple text-white text-2xl font-bold mb-4">M</div>
          <h1 className="text-2xl font-bold text-slate-900">Mirada OS</h1>
          <p className="text-sm text-slate-500 mt-1">Promise Portal &amp; Design Room</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
