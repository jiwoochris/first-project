import Link from "next/link";

import { logout } from "@/app/auth/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AuthNav() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="fixed right-4 top-4 z-50 flex items-center gap-2 rounded-full border border-neutral-200 bg-white/80 px-3 py-1.5 text-sm text-neutral-700 shadow-sm backdrop-blur sm:right-6 sm:top-6">
      {user ? (
        <>
          <span className="hidden max-w-[180px] truncate text-neutral-600 sm:inline">
            {user.email}
          </span>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-700 transition hover:border-neutral-500 hover:text-neutral-900"
            >
              로그아웃
            </button>
          </form>
        </>
      ) : (
        <>
          <Link
            href="/login"
            className="rounded-full px-3 py-1 text-xs font-medium text-neutral-700 transition hover:text-neutral-900"
          >
            로그인
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-neutral-900 px-3 py-1 text-xs font-medium text-white transition hover:bg-neutral-800"
          >
            회원가입
          </Link>
        </>
      )}
    </nav>
  );
}
