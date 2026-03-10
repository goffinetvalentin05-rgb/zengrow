alter table public.restaurants
  add column if not exists subscription_plan text,
  add column if not exists subscription_status text not null default 'trial',
  add column if not exists trial_start_date timestamptz not null default now(),
  add column if not exists trial_end_date timestamptz not null default (now() + interval '14 days'),
  add column if not exists trial_ends_at timestamptz,
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text;

update public.restaurants
set
  subscription_status = coalesce(subscription_status, 'trial'),
  trial_start_date = coalesce(trial_start_date, created_at, now()),
  trial_end_date = coalesce(trial_end_date, trial_ends_at, created_at + interval '14 days');

alter table public.restaurants
  alter column trial_start_date set not null,
  alter column trial_end_date set not null;

alter table public.restaurants
  drop constraint if exists restaurants_subscription_plan_check,
  add constraint restaurants_subscription_plan_check
    check (subscription_plan in ('starter', 'pro') or subscription_plan is null);

alter table public.restaurants
  drop constraint if exists restaurants_subscription_status_check,
  add constraint restaurants_subscription_status_check
    check (subscription_status in ('trial', 'active', 'expired'));

create unique index if not exists restaurants_stripe_customer_id_unique
  on public.restaurants (stripe_customer_id)
  where stripe_customer_id is not null;

create unique index if not exists restaurants_stripe_subscription_id_unique
  on public.restaurants (stripe_subscription_id)
  where stripe_subscription_id is not null;

create index if not exists restaurants_subscription_status_idx
  on public.restaurants (subscription_status);
