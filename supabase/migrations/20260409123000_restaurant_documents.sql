-- Multiple PDF documents per restaurant (menus, wine list, etc.)
-- Replaces the legacy single public_menu_pdf_url field.

create table if not exists public.restaurant_documents (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  label text not null,
  file_url text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists restaurant_documents_restaurant_id_idx
  on public.restaurant_documents (restaurant_id);

create index if not exists restaurant_documents_restaurant_id_position_idx
  on public.restaurant_documents (restaurant_id, position);

alter table public.restaurant_documents enable row level security;

-- Owner can manage their documents
create policy "restaurant_documents_owner_select"
on public.restaurant_documents for select
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = restaurant_documents.restaurant_id
      and r.owner_id = auth.uid()
  )
);

create policy "restaurant_documents_owner_insert"
on public.restaurant_documents for insert
with check (
  exists (
    select 1
    from public.restaurants r
    where r.id = restaurant_documents.restaurant_id
      and r.owner_id = auth.uid()
  )
);

create policy "restaurant_documents_owner_update"
on public.restaurant_documents for update
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = restaurant_documents.restaurant_id
      and r.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.restaurants r
    where r.id = restaurant_documents.restaurant_id
      and r.owner_id = auth.uid()
  )
);

create policy "restaurant_documents_owner_delete"
on public.restaurant_documents for delete
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = restaurant_documents.restaurant_id
      and r.owner_id = auth.uid()
  )
);

-- Public pages can display documents
create policy "restaurant_documents_public_select"
on public.restaurant_documents for select
using (true);

-- Drop legacy single-PDF column if present
alter table public.restaurant_settings
  drop column if exists public_menu_pdf_url;

