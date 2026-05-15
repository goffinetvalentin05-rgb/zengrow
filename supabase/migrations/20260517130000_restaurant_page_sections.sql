-- Sections page publique : copie éditoriale typée (contenu) séparée du rendu thème.
-- Une ligne par (restaurant_id, section_type) ; data = jsonb validé côté application.

create table if not exists public.restaurant_page_sections (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  section_type text not null,
  sort_index integer not null default 0,
  enabled boolean not null default true,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint restaurant_page_sections_type_check check (
    section_type in (
      'navigation',
      'hero',
      'concept',
      'highlights',
      'menu_offers',
      'gallery',
      'reviews',
      'gift_vouchers',
      'final_cta',
      'practical',
      'reservation_shell',
      'menu_documents'
    )
  ),
  constraint restaurant_page_sections_restaurant_type_uniq unique (restaurant_id, section_type)
);

create index if not exists restaurant_page_sections_restaurant_id_idx
  on public.restaurant_page_sections (restaurant_id);

comment on table public.restaurant_page_sections is
  'Contenu éditorial par section de la page publique (textes, libellés). Le thème ne fait que styliser.';

alter table public.restaurant_page_sections enable row level security;

create policy "restaurant_page_sections_owner_select"
on public.restaurant_page_sections for select
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = restaurant_page_sections.restaurant_id
      and r.owner_id = auth.uid()
  )
);

create policy "restaurant_page_sections_owner_insert"
on public.restaurant_page_sections for insert
with check (
  exists (
    select 1
    from public.restaurants r
    where r.id = restaurant_page_sections.restaurant_id
      and r.owner_id = auth.uid()
  )
);

create policy "restaurant_page_sections_owner_update"
on public.restaurant_page_sections for update
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = restaurant_page_sections.restaurant_id
      and r.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.restaurants r
    where r.id = restaurant_page_sections.restaurant_id
      and r.owner_id = auth.uid()
  )
);

create policy "restaurant_page_sections_owner_delete"
on public.restaurant_page_sections for delete
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = restaurant_page_sections.restaurant_id
      and r.owner_id = auth.uid()
  )
);

-- Page publique : lecture anonyme (même modèle que restaurant_documents).
create policy "restaurant_page_sections_public_select"
on public.restaurant_page_sections for select
using (true);

-- Préserve le cachet « Maison » sous l’image concept quand une image était déjà configurée.
insert into public.restaurant_page_sections (restaurant_id, section_type, sort_index, enabled, data)
select rs.restaurant_id, 'concept', 30, true, jsonb_build_object('imageStampLabel', 'Maison')
from public.restaurant_settings rs
where length(trim(coalesce(rs.public_page_editor_config->'premium'->'concept'->>'imageUrl', ''))) > 0
on conflict (restaurant_id, section_type) do nothing;
