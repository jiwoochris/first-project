"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { AuthFormState } from "@/app/auth/actions";

type Mode = "login" | "signup";

type Action = (
  state: AuthFormState,
  formData: FormData,
) => Promise<AuthFormState>;

const COPY: Record<Mode, {
  title: string;
  subtitle: string;
  submit: string;
  altPrompt: string;
  altLabel: string;
  altHref: string;
}> = {
  login: {
    title: "로그인",
    subtitle: "이메일과 비밀번호를 입력해 주세요.",
    submit: "로그인",
    altPrompt: "아직 계정이 없으신가요?",
    altLabel: "회원가입",
    altHref: "/signup",
  },
  signup: {
    title: "회원가입",
    subtitle: "새 계정을 만들어 갤러리에 참여해 주세요.",
    submit: "회원가입",
    altPrompt: "이미 계정이 있으신가요?",
    altLabel: "로그인",
    altHref: "/login",
  },
};

export default function AuthForm({
  mode,
  action,
}: {
  mode: Mode;
  action: Action;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const copy = COPY[mode];

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-xl">
      <h1 className="text-2xl font-semibold text-neutral-900">{copy.title}</h1>
      <p className="mt-2 text-sm text-neutral-500">{copy.subtitle}</p>

      <form action={formAction} className="mt-8 space-y-5">
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-xs font-medium uppercase tracking-widest text-neutral-700"
          >
            이메일
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-xs font-medium uppercase tracking-widest text-neutral-700"
          >
            비밀번호
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            minLength={6}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none"
            placeholder="••••••••"
          />
        </div>

        {state?.error && (
          <p className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {state.error}
          </p>
        )}
        {state?.message && (
          <p className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 w-full items-center justify-center rounded-full bg-neutral-900 px-6 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "처리 중…" : copy.submit}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        {copy.altPrompt}{" "}
        <Link
          href={copy.altHref}
          className="font-medium text-neutral-900 underline-offset-4 hover:underline"
        >
          {copy.altLabel}
        </Link>
      </p>
    </div>
  );
}
