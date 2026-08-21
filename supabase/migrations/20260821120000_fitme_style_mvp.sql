-- FITME Style Profile MVP
-- Additive only: does not drop or alter restaurant tables.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  first_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  onboarding_completed boolean not null default false
);

create index if not exists profiles_email_idx on public.profiles (email);

create table if not exists public.style_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'draft',
  payment_status text not null default 'unpaid',
  is_unlocked boolean not null default false,
  primary_style text,
  primary_style_score numeric,
  secondary_style text,
  secondary_style_score numeric,
  color_profile jsonb,
  style_notes jsonb,
  preferences jsonb,
  preview_data jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint style_analyses_status_check check (
    status in ('draft', 'uploaded', 'queued', 'analyzing', 'generating', 'completed', 'failed')
  ),
  constraint style_analyses_payment_check check (
    payment_status in ('unpaid', 'pending', 'paid', 'refunded')
  )
);

create index if not exists style_analyses_user_id_idx on public.style_analyses (user_id, created_at desc);
create index if not exists style_analyses_status_idx on public.style_analyses (status);

create table if not exists public.style_analysis_images (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.style_analyses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  storage_path text not null,
  generated_style text,
  is_generated boolean not null default false,
  created_at timestamptz not null default now(),
  constraint style_analysis_images_type_check check (
    type in ('portrait', 'full_body', 'extra', 'generated')
  )
);

create index if not exists style_analysis_images_analysis_id_idx
  on public.style_analysis_images (analysis_id);
create index if not exists style_analysis_images_user_id_idx
  on public.style_analysis_images (user_id);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  analysis_id uuid references public.style_analyses(id) on delete set null,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  amount integer not null,
  currency text not null default 'chf',
  status text not null default 'pending',
  product_type text not null default 'style_profile',
  created_at timestamptz not null default now(),
  constraint payments_status_check check (
    status in ('pending', 'paid', 'failed', 'refunded')
  )
);

create index if not exists payments_user_id_idx on public.payments (user_id);
create index if not exists payments_analysis_id_idx on public.payments (analysis_id);
create unique index if not exists payments_stripe_session_unique
  on public.payments (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

create table if not exists public.fit_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  analysis_id uuid references public.style_analyses(id) on delete set null,
  clothing_image_path text,
  clothing_url text,
  score numeric,
  verdict text,
  created_at timestamptz not null default now()
);

create index if not exists fit_checks_user_id_idx on public.fit_checks (user_id);

-- updated_at helper
create or replace function public.fitme_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.fitme_set_updated_at();

drop trigger if exists style_analyses_set_updated_at on public.style_analyses;
create trigger style_analyses_set_updated_at
before update on public.style_analyses
for each row execute function public.fitme_set_updated_at();

-- Auto-create profile on signup
create or replace function public.fitme_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name)
  values (
    new.id,
    new.email,
    nullif(coalesce(new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'full_name'), '')
  )
  on conflict (id) do update
    set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists fitme_on_auth_user_created on auth.users;
create trigger fitme_on_auth_user_created
after insert on auth.users
for each row execute function public.fitme_handle_new_user();

-- Prevent clients from writing privileged analysis fields
create or replace function public.fitme_protect_style_analysis()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  new.is_unlocked := old.is_unlocked;
  new.payment_status := old.payment_status;
  new.primary_style := old.primary_style;
  new.primary_style_score := old.primary_style_score;
  new.secondary_style := old.secondary_style;
  new.secondary_style_score := old.secondary_style_score;
  new.color_profile := old.color_profile;
  new.style_notes := old.style_notes;
  new.preview_data := old.preview_data;
  new.completed_at := old.completed_at;
  new.error_message := old.error_message;

  if old.status not in ('draft', 'uploaded') then
    new.status := old.status;
  elsif new.status not in ('draft', 'uploaded') then
    new.status := old.status;
  end if;

  return new;
end;
$$;

drop trigger if exists fitme_protect_style_analysis on public.style_analyses;
create trigger fitme_protect_style_analysis
before update on public.style_analyses
for each row execute function public.fitme_protect_style_analysis();

-- RLS
alter table public.profiles enable row level security;
alter table public.style_analyses enable row level security;
alter table public.style_analysis_images enable row level security;
alter table public.payments enable row level security;
alter table public.fit_checks enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "style_analyses_select_own" on public.style_analyses;
create policy "style_analyses_select_own"
on public.style_analyses for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "style_analyses_insert_own" on public.style_analyses;
create policy "style_analyses_insert_own"
on public.style_analyses for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "style_analyses_update_own_draft" on public.style_analyses;
create policy "style_analyses_update_own_draft"
on public.style_analyses for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "style_analysis_images_select_own" on public.style_analysis_images;
create policy "style_analysis_images_select_own"
on public.style_analysis_images for select
to authenticated
using (user_id = auth.uid() and is_generated = false);

drop policy if exists "style_analysis_images_insert_own_source" on public.style_analysis_images;
create policy "style_analysis_images_insert_own_source"
on public.style_analysis_images for insert
to authenticated
with check (user_id = auth.uid() and is_generated = false and type in ('portrait', 'full_body', 'extra'));

drop policy if exists "style_analysis_images_delete_own_source" on public.style_analysis_images;
create policy "style_analysis_images_delete_own_source"
on public.style_analysis_images for delete
to authenticated
using (user_id = auth.uid() and is_generated = false);

drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own"
on public.payments for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "fit_checks_select_own" on public.fit_checks;
create policy "fit_checks_select_own"
on public.fit_checks for select
to authenticated
using (user_id = auth.uid());

-- Column-level lock: authenticated cannot read paid result payloads via PostgREST
revoke all on public.style_analyses from anon, authenticated;
grant select (
  id,
  user_id,
  status,
  payment_status,
  is_unlocked,
  preferences,
  error_message,
  created_at,
  updated_at,
  completed_at
) on public.style_analyses to authenticated;
grant insert (
  id,
  user_id,
  status,
  preferences
) on public.style_analyses to authenticated;
grant update (
  preferences,
  status,
  updated_at
) on public.style_analyses to authenticated;

revoke all on public.style_analysis_images from anon, authenticated;
grant select, insert, delete on public.style_analysis_images to authenticated;

revoke all on public.payments from anon, authenticated;
grant select on public.payments to authenticated;

revoke all on public.fit_checks from anon, authenticated;
grant select on public.fit_checks to authenticated;

revoke all on public.profiles from anon, authenticated;
grant select, insert, update on public.profiles to authenticated;

grant all on public.profiles to service_role;
grant all on public.style_analyses to service_role;
grant all on public.style_analysis_images to service_role;
grant all on public.payments to service_role;
grant all on public.fit_checks to service_role;

-- Storage buckets (private)
insert into storage.buckets (id, name, public)
values ('style-inputs', 'style-inputs', false)
on conflict (id) do update set public = false;

insert into storage.buckets (id, name, public)
values ('style-results', 'style-results', false)
on conflict (id) do update set public = false;

-- Users may only manage their own source photos. Results stay service-role only.
drop policy if exists "style_inputs_select_own" on storage.objects;
create policy "style_inputs_select_own"
on storage.objects for select
to authenticated
using (
  bucket_id = 'style-inputs'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "style_inputs_insert_own" on storage.objects;
create policy "style_inputs_insert_own"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'style-inputs'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "style_inputs_update_own" on storage.objects;
create policy "style_inputs_update_own"
on storage.objects for update
to authenticated
using (
  bucket_id = 'style-inputs'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'style-inputs'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "style_inputs_delete_own" on storage.objects;
create policy "style_inputs_delete_own"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'style-inputs'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Backfill profiles for existing auth users
insert into public.profiles (id, email)
select id, email
from auth.users
on conflict (id) do nothing;
