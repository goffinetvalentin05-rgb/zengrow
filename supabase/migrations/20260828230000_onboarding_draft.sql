-- Reprise onboarding : brouillon JSON par étape.

alter table public.user_saas
  add column if not exists onboarding_draft jsonb;
