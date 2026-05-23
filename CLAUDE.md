# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — start Next.js dev server (http://localhost:3000)
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — ESLint (config in `eslint.config.mjs`, flat config extending `eslint-config-next`)

There is no test framework wired up.

## Stack

- **Next.js 16.2.6 / React 19** (App Router) with TypeScript strict mode
- **Tailwind CSS v4** (`@tailwindcss/postcss`, configured in `postcss.config.mjs`; no `tailwind.config.*` — v4 picks up styles from `src/app/globals.css`)
- **Supabase** for auth and data, via `@supabase/ssr` (SSR cookie-based sessions)
- **OpenRouter** (`google/gemini-3.1-flash-lite`) for AI page summarization
- Path alias: `@/*` → `./src/*`

## Next.js 16 specifics that bite

Per `AGENTS.md`, this is not the Next.js most training data knows. Two things in this repo that contradict older patterns:

- **Middleware lives in `proxy.ts` at the repo root, not `middleware.ts`.** The exported function is `proxy(request)` (not `middleware`). The `config.matcher` export still works the same way. Treat `proxy.ts` as the project's middleware-equivalent.
- **`cookies()` is async** (`const cookieStore = await cookies()`), as are dynamic APIs in Server Components. See `src/lib/supabase/server.ts`.

When in doubt, read the relevant guide in `node_modules/next/dist/docs/` before writing new code in unfamiliar areas.

## Supabase SSR architecture

Three Supabase client factories — each used in a specific environment, and they coordinate via cookies:

- `src/lib/supabase/client.ts` — `createBrowserClient` for `"use client"` components.
- `src/lib/supabase/server.ts` — `createServerClient` bound to Next's `cookies()`. The `setAll` callback is wrapped in `try/catch` because Server Components can't write cookies; in that case the silent failure is intentional — the **`proxy.ts` middleware refreshes the session on the next request**.
- `proxy.ts` — calls `supabase.auth.getUser()` on every matched request to keep the session cookie fresh. The cookie matcher excludes `_next/static`, `_next/image`, `favicon.ico`, and common image extensions.

If you add a new server-side Supabase usage, always go through `createSupabaseServerClient()` — never construct clients ad hoc, or session refresh will desync.

Env vars required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (note: this project uses the new "publishable key" name, not `ANON_KEY`)
- `OPENROUTER_API_KEY` (server-only; `submitProject` silently skips AI summary if missing)

A Supabase MCP server is configured in `.mcp.json` against project `xskhcscsapwlkpikrubw` — prefer MCP tools for schema inspection over guessing.

## Data model

Single table `public.user_projects` (DDL in `supabase/user_projects.sql`, run manually in the Supabase SQL editor). RLS is enabled with three policies:

- `select` — public (anonymous reads allowed)
- `insert` — `authenticated`, `auth.uid() = user_id` only
- `delete` — `authenticated`, owner only

Server Actions in `src/app/projects/actions.ts` enforce the same checks before hitting Supabase, but RLS is the authoritative gate. When extending the schema, update both the SQL file and the policy block.

## Server Actions

All mutations are Server Actions, not API routes (the only route handler is `src/app/auth/confirm/route.ts` for Supabase email OTP redirects):

- `src/app/auth/actions.ts` — `signUp`, `login`, `logout`. Each calls `revalidatePath("/", "layout")` and `redirect("/")` on success.
- `src/app/projects/actions.ts` — `submitProject`, `deleteProject`, `listUserProjects`, `previewProjectImage`.

`useActionState` is the client-side binding pattern; see `src/components/AuthForm.tsx` and `src/components/SubmitProjectModal.tsx`.

## AI summary pipeline

`submitProject` → `fetchPageInfo(url)` (in `src/lib/ai/summarize.ts`) scrapes the target page with strict limits (`PAGE_FETCH_TIMEOUT_MS=8s`, `MAX_PAGE_BYTES=200KB`, content-type must be HTML/text), extracts `<title>`, meta description, body text, and the best og/twitter/img candidate → `summarizeWithGemini` posts to OpenRouter and asks for exactly 3 Korean lines.

If page fetch fails or OpenRouter is misconfigured, the project still saves — `description` and `image_url` just stay null. Failures are `console.warn`'d, never thrown. Preserve that defensive shape when editing.

## UI conventions

- All user-facing copy is **Korean (한국어)**. Match the existing tone when adding strings; do not silently switch to English.
- Light theme baseline: `bg-white text-neutral-900`, muted text `text-neutral-500/600`, borders `border-neutral-200/300`, primary button `bg-neutral-900 text-white`, accent `indigo-500/600`, error `rose-50/300/700`, success `emerald-50/300/700`.
- Forms use the `useActionState` + Server Action pattern; show inline error/message banners (see `AuthForm.tsx` lines 94–103 for the canonical style).

## 한국어로 답하기

- 응답은 항상 한국어로.
- 어려운 용어 쓰지 말고 초보자한테 말하듯이 설명해줘.
- 결과만 보여주지 말고 다음에 뭘 해야 하는지도 알려줘.