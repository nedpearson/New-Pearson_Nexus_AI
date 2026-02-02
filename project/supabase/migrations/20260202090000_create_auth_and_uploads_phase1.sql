/*
  Phase 1: Move server/data.json → Supabase Postgres (+ Storage for uploads)

  Tables:
    - organizations
    - users
    - refresh_tokens
    - password_resets
    - uploads

  Notes:
    - These tables are intended for server-side access using the Supabase SERVICE ROLE key.
    - RLS is enabled with no permissive policies by default (service role bypasses RLS).
*/

-- Organizations
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text not null default 'basic' check (plan in ('basic', 'professional', 'business')),
  created_at timestamptz not null default now()
);

alter table public.organizations enable row level security;

-- Users (server-managed auth; not Supabase Auth)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  name text,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  is_demo boolean not null default false,
  face_recognition_enabled boolean not null default false,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists users_email_unique on public.users ((lower(email)));
create index if not exists users_org_idx on public.users (organization_id);

alter table public.users enable row level security;

-- Refresh tokens (rotation family per user)
create table if not exists public.refresh_tokens (
  user_id uuid primary key references public.users(id) on delete cascade,
  token_hash text not null,
  jti uuid not null,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);

create index if not exists refresh_tokens_expires_idx on public.refresh_tokens (expires_at);

alter table public.refresh_tokens enable row level security;

-- Password reset tokens (hashed)
create table if not exists public.password_resets (
  token_hash text primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz null,
  created_at timestamptz not null default now()
);

create index if not exists password_resets_expires_idx on public.password_resets (expires_at);
create index if not exists password_resets_user_idx on public.password_resets (user_id);

alter table public.password_resets enable row level security;

-- Uploads metadata (file bytes live in Supabase Storage)
create table if not exists public.uploads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid null references public.organizations(id) on delete set null,
  created_by uuid null references public.users(id) on delete set null,

  original_name text not null,
  -- Legacy-friendly name used by existing UI; in Supabase Storage this is the object key.
  stored_name text not null,
  storage_path text not null,
  mime_type text not null,
  size bigint not null,
  sha256 text not null,

  case_id text null,
  tags jsonb not null default '[]'::jsonb,
  notes text not null default '',
  captured_at timestamptz null,
  location text null,

  created_at timestamptz not null default now()
);

create index if not exists uploads_created_at_idx on public.uploads (created_at desc);
create index if not exists uploads_org_idx on public.uploads (organization_id);

alter table public.uploads enable row level security;

