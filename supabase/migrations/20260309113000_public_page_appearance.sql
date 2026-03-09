-- Public reservation page personalization

alter table public.restaurant_settings
  add column if not exists button_color text default '#1F7A6C',
  add column if not exists instagram_url text,
  add column if not exists facebook_url text,
  add column if not exists website_url text,
  add column if not exists pre_booking_message text;

-- Storage bucket for restaurant assets (logo / cover)
insert into storage.buckets (id, name, public)
values ('restaurant-assets', 'restaurant-assets', true)
on conflict (id) do nothing;

drop policy if exists "restaurant_assets_public_read" on storage.objects;
create policy "restaurant_assets_public_read"
on storage.objects for select
using (bucket_id = 'restaurant-assets');

drop policy if exists "restaurant_assets_authenticated_insert" on storage.objects;
create policy "restaurant_assets_authenticated_insert"
on storage.objects for insert
to authenticated
with check (bucket_id = 'restaurant-assets');

drop policy if exists "restaurant_assets_authenticated_update" on storage.objects;
create policy "restaurant_assets_authenticated_update"
on storage.objects for update
to authenticated
using (bucket_id = 'restaurant-assets')
with check (bucket_id = 'restaurant-assets');

drop policy if exists "restaurant_assets_authenticated_delete" on storage.objects;
create policy "restaurant_assets_authenticated_delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'restaurant-assets');
