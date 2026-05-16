import Link from "next/link";

import { logout } from "@/app/auth/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AuthNav() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="fixed right-4 top-4 z-50 flex items-center gap-2 rounded-full border border-white/10 bg-neutral-950/70 px-3 py-1.5 text-sm text-neutral-200 backdrop-blur sm:right-6 sm:top-6">
      {user ? (
        <>
          <span className="hidden max-w-[180px] truncate text-neutral-300 sm:inline">
            {user.email}
          </span>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-full border border-white/15 px-3 py-1 text-xs font-medium text-neutral-200 transition hover:border-white/40 hover:text-white"
            >
              로그아웃
            </button>
          </form>
        </>
      ) : (
        <>
          <Link
            href="/login"
            className="rounded-full px-3 py-1 text-xs font-medium text-neutral-200 transition hover:text-white"
          >
            로그인
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-white px-3 py-1 text-xs font-medium text-neutral-900 transition hover:bg-neutral-200"
          >
            회원가입
          </Link>
        </>
      )}
    </nav>
  );
}
