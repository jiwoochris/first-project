import { redirect } from "next/navigation";

import AuthForm from "@/components/AuthForm";
import { login } from "@/app/auth/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "로그인 — Web Projects Gallery",
};

export default async function LoginPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/");

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-20">
      <AuthForm mode="login" action={login} />
    </main>
  );
}
