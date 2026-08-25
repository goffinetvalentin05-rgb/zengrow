-- Remove FITME-only schema, storage and triggers.
-- Does not touch auth.users, restaurants, restaurant billing, or ZenGrow dashboard tables.

-- Triggers (auth.users trigger created FitMe profiles on every signup, including restaurant owners)
drop trigger if exists fitme_on_auth_user_created on auth.users;
drop trigger if exists profiles_set_updated_at on public.profiles;
drop trigger if exists style_analyses_set_updated_at on public.style_analyses;
drop trigger if exists fitme_protect_style_analysis on public.style_analyses;

-- Functions
drop function if exists public.fitme_handle_new_user();
drop function if exists public.fitme_protect_style_analysis();
drop function if exists public.fitme_set_updated_at();

-- Storage policies (FitMe source photos only)
drop policy if exists "style_inputs_select_own" on storage.objects;
drop policy if exists "style_inputs_insert_own" on storage.objects;
drop policy if exists "style_inputs_update_own" on storage.objects;
drop policy if exists "style_inputs_delete_own" on storage.objects;

-- Storage objects + buckets (style-inputs / style-results are FitMe-only)
delete from storage.objects where bucket_id in ('style-inputs', 'style-results');
delete from storage.buckets where id in ('style-inputs', 'style-results');

-- Tables used exclusively by FitMe (dependents first)
drop table if exists public.fit_checks cascade;
drop table if exists public.payments cascade;
drop table if exists public.style_analysis_images cascade;
drop table if exists public.style_analyses cascade;
drop table if exists public.profiles cascade;
