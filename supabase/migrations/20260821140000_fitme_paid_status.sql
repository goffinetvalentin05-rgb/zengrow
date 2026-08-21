-- Add paid status + provider column. Additive; keeps existing FITME RLS.

alter table public.style_analyses
  add column if not exists ai_provider text;

alter table public.style_analyses
  drop constraint if exists style_analyses_status_check;

alter table public.style_analyses
  add constraint style_analyses_status_check check (
    status in (
      'draft',
      'uploaded',
      'queued',
      'analyzing',
      'preview_ready',
      'awaiting_payment',
      'paid',
      'generating_looks',
      'completed',
      'failed'
    )
  );

-- Service-role pipeline may persist which provider produced the result.
grant update (
  preferences,
  updated_at
) on public.style_analyses to authenticated;
