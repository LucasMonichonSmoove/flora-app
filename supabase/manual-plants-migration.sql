alter table public.plants_collection
  add column if not exists family_name text not null default '',
  add column if not exists description text,
  add column if not exists is_manual boolean not null default false,
  add column if not exists source text not null default 'plantnet';

alter table public.identification_history
  add column if not exists source text not null default 'plantnet',
  alter column score drop not null;

insert into storage.buckets (id, name, public)
values ('plant-images', 'plant-images', true)
on conflict (id) do nothing;

drop policy if exists "Users can upload their plant images" on storage.objects;
create policy "Users can upload their plant images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'plant-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can delete their plant images" on storage.objects;
create policy "Users can delete their plant images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'plant-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Plant images are publicly readable" on storage.objects;
create policy "Plant images are publicly readable"
  on storage.objects for select to public
  using (bucket_id = 'plant-images');
