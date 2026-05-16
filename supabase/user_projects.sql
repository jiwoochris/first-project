-- Run this once in the Supabase SQL editor (Project > SQL > New query).

create table if not exists public.user_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  url text not null check (url ~* '^https?://.+'),
  author_email text,
  created_at timestamptz not null default now()
);

alter table public.user_projects
  add column if not exists description text;

alter table public.user_projects
  add column if not exists image_url text;

create index if not exists user_projects_created_at_idx
  on public.user_projects (created_at desc);

alter table public.user_projects enable row level security;

-- Anyone (including anonymous visitors) can read submitted projects.
drop policy if exists "user_projects_select_all" on public.user_projects;
create policy "user_projects_select_all"
  on public.user_projects for select
  using (true);

-- Only authenticated users can insert, and only as themselves.
drop policy if exists "user_projects_insert_own" on public.user_projects;
create policy "user_projects_insert_own"
  on public.user_projects for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can delete their own projects.
drop policy if exists "user_projects_delete_own" on public.user_projects;
create policy "user_projects_delete_own"
  on public.user_projects for delete
  to authenticated
  using (auth.uid() = user_id);
