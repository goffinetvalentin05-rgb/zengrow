-- Profile appearance: cover image, theme, featured-first layout.
-- Additive. Does not drop existing discovery tables or auth objects.

alter table public.profiles
  add column if not exists theme_key text not null default 'obsidian';

alter table public.profiles
  add column if not exists cover_image_url text;

alter table public.profiles
  add column if not exists featured_first boolean not null default false;

alter table public.profiles
  drop constraint if exists profiles_theme_key_chk;

alter table public.profiles
  add constraint profiles_theme_key_chk
  check (theme_key in ('obsidian', 'electric', 'forest', 'violet', 'crimson'));

insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

drop policy if exists covers_public_read on storage.objects;
create policy covers_public_read
  on storage.objects for select
  using (bucket_id = 'covers');

drop policy if exists covers_auth_insert on storage.objects;
create policy covers_auth_insert
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'covers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists covers_auth_update on storage.objects;
create policy covers_auth_update
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'covers'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'covers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists covers_auth_delete on storage.objects;
create policy covers_auth_delete
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'covers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
