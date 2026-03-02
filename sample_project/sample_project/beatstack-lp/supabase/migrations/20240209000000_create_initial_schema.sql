-- ============================================
-- Migration: 初期スキーマ作成
-- Purpose: BeatStack のユーザー管理とアクティベーション機能
-- ============================================

-- 1. Users Table (Synced with Clerk)
create table public.users (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text unique not null,
  email text not null,
  full_name text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
comment on table public.users is 'Clerkユーザーと同期されるユーザー情報';

-- RLS: Users
alter table public.users enable row level security;

-- Policy: 自分のデータのみ読み書き可能（Clerk IDで判定）
create policy "users_select_own" on public.users
  for select to authenticated
  using (clerk_user_id = auth.jwt() ->> 'sub');

create policy "users_insert_own" on public.users
  for insert to authenticated
  with check (clerk_user_id = auth.jwt() ->> 'sub');

create policy "users_update_own" on public.users
  for update to authenticated
  using (clerk_user_id = auth.jwt() ->> 'sub');

-- 2. Activations Table (Product Serial Codes)
create table public.activations (
  id uuid primary key default gen_random_uuid(),
  serial_code text unique not null,
  is_used boolean default false not null,
  used_at timestamptz,
  used_by_user_id uuid references public.users(id),
  created_at timestamptz default now() not null
);
comment on table public.activations is '製品シリアルコードの管理テーブル';

-- RLS: Activations
alter table public.activations enable row level security;

-- Policy: 自分のアクティベーション情報のみ参照可能
create policy "activations_select_own" on public.activations
  for select to authenticated
  using (used_by_user_id in (select id from public.users where clerk_user_id = auth.jwt() ->> 'sub'));

-- Policy: シリアルコードの確認（未使用なら誰でも確認できる必要があるが、セキュリティ上Server Action経由を推奨するため、一旦publicアクセスは閉じる）
-- 認証処理は Service Role (Server Action) で行うため、authenticated 向けの INSERT/UPDATE ポリシーは不要（または厳格に制限）

-- Indexes
create index idx_users_clerk_id on public.users(clerk_user_id);
create index idx_activations_serial on public.activations(serial_code);
create index idx_activations_user on public.activations(used_by_user_id);
