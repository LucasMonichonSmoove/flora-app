create extension if not exists pgcrypto;

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scientific_name text not null,
  common_name text not null,
  family_name text not null,
  image_url text,
  created_at timestamptz not null default now(),
  constraint favorites_user_scientific_name_key
    unique (user_id, scientific_name)
);

grant select, insert, update, delete on public.favorites to authenticated;
revoke all on public.favorites from anon;

create index if not exists favorites_user_created_at_idx
  on public.favorites (user_id, created_at desc);

alter table public.favorites enable row level security;

drop policy if exists "Users can read their favorites" on public.favorites;
create policy "Users can read their favorites"
  on public.favorites for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can add their favorites" on public.favorites;
create policy "Users can add their favorites"
  on public.favorites for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their favorites" on public.favorites;
create policy "Users can update their favorites"
  on public.favorites for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their favorites" on public.favorites;
create policy "Users can delete their favorites"
  on public.favorites for delete to authenticated
  using ((select auth.uid()) = user_id);

create table if not exists public.plants_collection (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scientific_name text not null,
  common_name text not null,
  image_url text,
  nickname text,
  purchase_date date,
  location text,
  notes text,
  last_watered timestamptz,
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.plants_collection to authenticated;
revoke all on public.plants_collection from anon;

create index if not exists plants_collection_user_created_at_idx
  on public.plants_collection (user_id, created_at desc);

create index if not exists plants_collection_user_last_watered_idx
  on public.plants_collection (user_id, last_watered);

alter table public.plants_collection enable row level security;

drop policy if exists "Users can read their plant collection" on public.plants_collection;
create policy "Users can read their plant collection"
  on public.plants_collection for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can add to their plant collection" on public.plants_collection;
create policy "Users can add to their plant collection"
  on public.plants_collection for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their plant collection" on public.plants_collection;
create policy "Users can update their plant collection"
  on public.plants_collection for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete from their plant collection" on public.plants_collection;
create policy "Users can delete from their plant collection"
  on public.plants_collection for delete to authenticated
  using ((select auth.uid()) = user_id);

create table if not exists public.identification_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scientific_name text not null,
  common_name text not null,
  family_name text not null,
  score double precision not null check (score >= 0 and score <= 1),
  image_url text,
  created_at timestamptz not null default now()
);

grant select, insert, delete on public.identification_history to authenticated;
revoke all on public.identification_history from anon;

create index if not exists identification_history_user_created_at_idx
  on public.identification_history (user_id, created_at desc);

alter table public.identification_history enable row level security;

drop policy if exists "Users can read their identification history" on public.identification_history;
create policy "Users can read their identification history"
  on public.identification_history for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can add to their identification history" on public.identification_history;
create policy "Users can add to their identification history"
  on public.identification_history for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their identification history" on public.identification_history;
create policy "Users can delete their identification history"
  on public.identification_history for delete to authenticated
  using ((select auth.uid()) = user_id);
