-- Discovery pass 2: optional age + avatars bucket + LinkedIn featured content.
-- Additive. Does not drop existing discovery tables.

alter table public.profiles
  add column if not exists birth_date date;

alter table public.profiles
  drop constraint if exists profiles_birth_date_adult_chk;

alter table public.profiles
  add constraint profiles_birth_date_adult_chk
  check (
    birth_date is null
    or birth_date <= (current_date - interval '18 years')
  );

create index if not exists profiles_country_idx
  on public.profiles (country)
  where is_public = true and is_disabled = false;

alter table public.featured_content
  drop constraint if exists featured_content_platform_chk;

alter table public.featured_content
  add constraint featured_content_platform_chk
  check (platform in ('youtube', 'instagram', 'tiktok', 'x', 'linkedin', 'article', 'other'));

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists avatars_public_read on storage.objects;
create policy avatars_public_read
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists avatars_auth_insert on storage.objects;
create policy avatars_auth_insert
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists avatars_auth_update on storage.objects;
create policy avatars_auth_update
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists avatars_auth_delete on storage.objects;
create policy avatars_auth_delete
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
