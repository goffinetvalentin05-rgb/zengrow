-- V1 learning schema. Does not drop legacy product tables.
-- Depends on learner_set_updated_at() from 20260930150000_learner_profiles.sql.

create table if not exists public.learning_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint learning_categories_name_chk check (char_length(trim(name)) between 1 and 80),
  constraint learning_categories_slug_chk check (char_length(slug) between 1 and 80),
  unique (user_id, slug)
);

create table if not exists public.learning_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null,
  title text not null,
  body text,
  translation text,
  example text,
  incorrect_form text,
  correct_form text,
  category_id uuid references public.learning_categories (id) on delete set null,
  source_kind text,
  source_label text,
  status text not null default 'new',
  origin text not null default 'manual',
  external_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint learning_items_kind_chk check (kind in ('vocabulary', 'expression', 'correction', 'grammar')),
  constraint learning_items_status_chk check (status in ('new', 'learning', 'mastered')),
  constraint learning_items_origin_chk check (origin in ('manual', 'chatgpt')),
  constraint learning_items_source_kind_chk check (
    source_kind is null or source_kind in ('chatgpt', 'podcast', 'book', 'video', 'work', 'other')
  ),
  constraint learning_items_title_chk check (char_length(trim(title)) between 1 and 300)
);

create unique index if not exists learning_items_user_external_ref_idx
  on public.learning_items (user_id, external_ref)
  where external_ref is not null;

create index if not exists learning_items_user_status_idx
  on public.learning_items (user_id, status, updated_at desc);

create index if not exists learning_items_user_kind_idx
  on public.learning_items (user_id, kind);

create table if not exists public.review_states (
  item_id uuid primary key references public.learning_items (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  due_at timestamptz not null default now(),
  interval_days integer not null default 0,
  ease numeric not null default 2.5,
  repetitions integer not null default 0,
  lapses integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint review_states_ease_chk check (ease >= 1.3),
  constraint review_states_counts_chk check (interval_days >= 0 and repetitions >= 0 and lapses >= 0)
);

create index if not exists review_states_user_due_idx
  on public.review_states (user_id, due_at);

create table if not exists public.review_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  item_id uuid not null references public.learning_items (id) on delete cascade,
  reviewed_at timestamptz not null default now(),
  rating text not null,
  interval_days_after integer not null default 0,
  constraint review_logs_rating_chk check (rating in ('again', 'hard', 'good', 'easy'))
);

create index if not exists review_logs_user_reviewed_idx
  on public.review_logs (user_id, reviewed_at desc);

create index if not exists review_logs_item_idx
  on public.review_logs (item_id, reviewed_at desc);

create table if not exists public.weekly_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  week_start date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start)
);

create table if not exists public.weekly_plan_slots (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.weekly_plans (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  weekday integer not null,
  minutes integer not null,
  activity text not null,
  note text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint weekly_plan_slots_weekday_chk check (weekday between 1 and 7),
  constraint weekly_plan_slots_minutes_chk check (minutes > 0 and minutes <= 600),
  constraint weekly_plan_slots_activity_chk check (
    activity in ('conversation', 'podcast', 'reading', 'video', 'review', 'other')
  )
);

create index if not exists weekly_plan_slots_plan_idx
  on public.weekly_plan_slots (plan_id, weekday);

create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  minutes integer,
  activity text not null,
  source_label text,
  plan_slot_id uuid unique references public.weekly_plan_slots (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint study_sessions_minutes_chk check (minutes is null or minutes >= 0),
  constraint study_sessions_activity_chk check (
    activity in ('conversation', 'podcast', 'reading', 'video', 'review', 'other')
  )
);

create index if not exists study_sessions_user_started_idx
  on public.study_sessions (user_id, started_at desc);

create table if not exists public.learning_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  week_start date not null,
  target_minutes integer,
  target_reviews integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start),
  constraint learning_goals_targets_chk check (
    (target_minutes is null or target_minutes >= 0)
    and (target_reviews is null or target_reviews >= 0)
  )
);

create table if not exists public.api_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  token_hash text not null unique,
  prefix text not null,
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  constraint api_tokens_name_chk check (char_length(trim(name)) between 1 and 80)
);

create index if not exists api_tokens_user_idx
  on public.api_tokens (user_id, created_at desc);

-- Keep item owner and review owner aligned.
create or replace function public.learn_assert_item_owner()
returns trigger
language plpgsql
as $$
declare
  owner uuid;
begin
  select user_id into owner from public.learning_items where id = new.item_id;
  if owner is null or owner <> new.user_id then
    raise exception 'item does not belong to user';
  end if;
  return new;
end;
$$;

drop trigger if exists review_states_owner_guard on public.review_states;
create trigger review_states_owner_guard
  before insert or update on public.review_states
  for each row execute function public.learn_assert_item_owner();

drop trigger if exists review_logs_owner_guard on public.review_logs;
create trigger review_logs_owner_guard
  before insert or update on public.review_logs
  for each row execute function public.learn_assert_item_owner();

create or replace function public.learn_assert_plan_owner()
returns trigger
language plpgsql
as $$
declare
  owner uuid;
begin
  select user_id into owner from public.weekly_plans where id = new.plan_id;
  if owner is null or owner <> new.user_id then
    raise exception 'plan does not belong to user';
  end if;
  return new;
end;
$$;

drop trigger if exists weekly_plan_slots_owner_guard on public.weekly_plan_slots;
create trigger weekly_plan_slots_owner_guard
  before insert or update on public.weekly_plan_slots
  for each row execute function public.learn_assert_plan_owner();

do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'learning_categories',
    'learning_items',
    'review_states',
    'weekly_plans',
    'weekly_plan_slots',
    'learning_goals'
  ]
  loop
    execute format('drop trigger if exists %I_set_updated_at on public.%I', tbl, tbl);
    execute format(
      'create trigger %I_set_updated_at before update on public.%I for each row execute function public.learner_set_updated_at()',
      tbl, tbl
    );
  end loop;
end $$;

alter table public.learning_categories enable row level security;
alter table public.learning_items enable row level security;
alter table public.review_states enable row level security;
alter table public.review_logs enable row level security;
alter table public.weekly_plans enable row level security;
alter table public.weekly_plan_slots enable row level security;
alter table public.study_sessions enable row level security;
alter table public.learning_goals enable row level security;
alter table public.api_tokens enable row level security;

do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'learning_categories',
    'learning_items',
    'review_states',
    'review_logs',
    'weekly_plans',
    'weekly_plan_slots',
    'study_sessions',
    'learning_goals',
    'api_tokens'
  ]
  loop
    execute format('drop policy if exists %I_own on public.%I', tbl, tbl);
    execute format(
      'create policy %I_own on public.%I for all using (user_id = auth.uid()) with check (user_id = auth.uid())',
      tbl, tbl
    );
    execute format('grant select, insert, update, delete on public.%I to authenticated', tbl);
    execute format('grant all on public.%I to service_role', tbl);
  end loop;
end $$;

-- The owner may manage tokens, but must not read the hash back.
revoke select (token_hash) on public.api_tokens from authenticated, anon;
