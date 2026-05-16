alter table public.feedbacks
  add column if not exists read_at timestamptz;

comment on column public.feedbacks.read_at is
  'Horodatage de lecture côté restaurateur ; null = non lu.';
