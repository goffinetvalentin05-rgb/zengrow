alter table public.restaurant_settings
  add column if not exists closure_start_date date,
  add column if not exists closure_end_date date,
  add column if not exists closure_message text;

alter table public.restaurant_settings
  drop constraint if exists restaurant_settings_closure_period_check;

alter table public.restaurant_settings
  add constraint restaurant_settings_closure_period_check
  check (
    closure_start_date is null
    or closure_end_date is null
    or closure_start_date <= closure_end_date
  );
