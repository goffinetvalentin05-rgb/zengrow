-- Notifications in-app pour le tableau de bord restaurateur.
-- Idempotent : relançable si le type ou la table existent déjà (ex. exécution partielle dans le SQL Editor).

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'notification_type'
  ) then
    create type public.notification_type as enum (
      'reservation_created',
      'reservation_cancelled',
      'reservation_modified',
      'reservation_no_show',
      'feedback_received',
      'system'
    );
  end if;
end $$;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  type public.notification_type not null,
  title text not null,
  message text not null,
  related_entity_type text,
  related_entity_id uuid,
  action_url text,
  read boolean not null default false,
  created_at timestamptz not null default now(),
  constraint notifications_title_length check (char_length(trim(title)) between 1 and 120),
  constraint notifications_message_length check (char_length(trim(message)) between 1 and 500),
  constraint notifications_related_entity_type_length check (
    related_entity_type is null or char_length(trim(related_entity_type)) between 1 and 40
  ),
  constraint notifications_action_url_length check (
    action_url is null or char_length(action_url) <= 500
  )
);

comment on table public.notifications is 'Notifications in-app affichées dans la cloche du dashboard restaurateur.';
comment on column public.notifications.read is 'false = non lue (badge + point bleu dans le panel).';

create index if not exists notifications_restaurant_read_created_idx
  on public.notifications (restaurant_id, read, created_at desc);

create index if not exists notifications_restaurant_unread_created_idx
  on public.notifications (restaurant_id, created_at desc)
  where read = false;

create index if not exists notifications_restaurant_type_created_idx
  on public.notifications (restaurant_id, type, created_at desc);

alter table public.notifications enable row level security;

-- Lecture / mise à jour / suppression : propriétaire du restaurant uniquement.
-- Les INSERT passent par le service role (createNotification côté serveur).

drop policy if exists "notifications_select_own_restaurant" on public.notifications;
create policy "notifications_select_own_restaurant"
  on public.notifications
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.restaurants r
      where r.id = notifications.restaurant_id
        and r.owner_id = (select auth.uid())
    )
  );

drop policy if exists "notifications_update_own_restaurant" on public.notifications;
create policy "notifications_update_own_restaurant"
  on public.notifications
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.restaurants r
      where r.id = notifications.restaurant_id
        and r.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.restaurants r
      where r.id = notifications.restaurant_id
        and r.owner_id = (select auth.uid())
    )
  );

drop policy if exists "notifications_delete_own_restaurant" on public.notifications;
create policy "notifications_delete_own_restaurant"
  on public.notifications
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.restaurants r
      where r.id = notifications.restaurant_id
        and r.owner_id = (select auth.uid())
    )
  );

-- Realtime : postgres_changes sur INSERT (étape 4 UI).
alter table public.notifications replica identity full;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;
