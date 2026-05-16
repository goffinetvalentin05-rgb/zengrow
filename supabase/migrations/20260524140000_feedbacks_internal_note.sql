alter table public.feedbacks
  add column if not exists internal_note text;

comment on column public.feedbacks.internal_note is
  'Note interne équipe, non visible du client.';
