-- P0.4 — Notifications Growth Sharpz (réutilise notifications legacy, sans fake).

do $$ begin
  alter type public.notification_type add value 'growth_follow_up_due';
exception when duplicate_object then null;
end $$;

do $$ begin
  alter type public.notification_type add value 'growth_experiment_due';
exception when duplicate_object then null;
end $$;

do $$ begin
  alter type public.notification_type add value 'growth_experiment_overdue';
exception when duplicate_object then null;
end $$;

do $$ begin
  alter type public.notification_type add value 'growth_traffic_signal';
exception when duplicate_object then null;
end $$;

do $$ begin
  alter type public.notification_type add value 'growth_revenue_signal';
exception when duplicate_object then null;
end $$;

do $$ begin
  alter type public.notification_type add value 'growth_competitor_change';
exception when duplicate_object then null;
end $$;

alter table public.notifications
  add column if not exists dedup_key text,
  add column if not exists severity text;

alter table public.notifications
  drop constraint if exists notifications_severity_chk;

alter table public.notifications
  add constraint notifications_severity_chk
  check (severity is null or severity in ('info', 'attention', 'critical'));

-- related_entity_id était uuid : trop strict pour clés growth groupées → text.
alter table public.notifications
  alter column related_entity_id type text
  using related_entity_id::text;

create unique index if not exists notifications_restaurant_dedup_key_uidx
  on public.notifications (restaurant_id, dedup_key)
  where dedup_key is not null;

comment on column public.notifications.dedup_key is
  'Clé anti-doublon (ex. growth_follow_up_due:2026-08-29). Unique par restaurant.';
comment on column public.notifications.severity is
  'info | attention | critical — notifications Growth Sharpz.';
