import { redirect } from "next/navigation";

import AuthForm from "@/components/AuthForm";
import { signUp } from "@/app/auth/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "회원가입 — Web Projects Gallery",
};

export default async function SignupPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/");

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-20">
      <AuthForm mode="signup" action={signUp} />
    </main>
  );
}
