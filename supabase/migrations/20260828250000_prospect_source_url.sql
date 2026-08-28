-- Source de découverte Agent (URL de la page trouvée lors de la recherche).

alter table public.prospects
  add column if not exists source_url text;

create index if not exists prospects_restaurant_source_url_idx
  on public.prospects (restaurant_id, source_url)
  where source_url is not null;
