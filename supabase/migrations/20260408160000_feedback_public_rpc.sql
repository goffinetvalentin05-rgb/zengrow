-- Page /feedback et POST /api/feedback/submit accessibles sans SUPABASE_SERVICE_ROLE_KEY côté Next.

create or replace function public.get_pending_feedback_by_token(p_token text)
returns table (
  id uuid,
  token text,
  initial_response text,
  responded_at timestamptz,
  customer_name text,
  customer_email text,
  restaurant_id uuid,
  reservation_id uuid,
  restaurant_name text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    f.id,
    f.token,
    f.initial_response::text,
    f.responded_at,
    f.customer_name,
    f.customer_email,
    f.restaurant_id,
    f.reservation_id,
    r.name::text as restaurant_name
  from public.feedbacks f
  inner join public.restaurants r on r.id = f.restaurant_id
  where f.token is not null
    and f.responded_at is null
    and f.token = trim(p_token)
  limit 1;
$$;

grant execute on function public.get_pending_feedback_by_token(text) to anon, authenticated;

create or replace function public.get_reservation_for_public_feedback(p_id uuid)
returns table (
  guest_name text,
  guest_email text,
  restaurant_id uuid
)
language sql
stable
security definer
set search_path = public
as $$
  select r.guest_name, r.guest_email, r.restaurant_id
  from public.reservations r
  where r.id = p_id
    and r.status = 'completed';
$$;

grant execute on function public.get_reservation_for_public_feedback(uuid) to anon, authenticated;

create or replace function public.submit_feedback_by_token(
  p_token text,
  p_rating int,
  p_message text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  n int;
begin
  if p_rating is null or p_rating < 1 or p_rating > 5 then
    return false;
  end if;
  if p_message is null or length(trim(p_message)) = 0 then
    return false;
  end if;

  update public.feedbacks
  set
    rating = p_rating,
    message = trim(p_message),
    responded_at = now()
  where token = trim(p_token)
    and responded_at is null;

  get diagnostics n = row_count;
  return n > 0;
end;
$$;

grant execute on function public.submit_feedback_by_token(text, int, text) to anon, authenticated;

create or replace function public.submit_feedback_legacy(
  p_reservation_id uuid,
  p_restaurant_id uuid,
  p_rating int,
  p_message text,
  p_customer_name text,
  p_customer_email text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  n int;
begin
  if p_rating is null or p_rating < 1 or p_rating > 5 then
    return false;
  end if;
  if p_message is null or length(trim(p_message)) = 0 then
    return false;
  end if;

  insert into public.feedbacks (
    restaurant_id,
    reservation_id,
    customer_name,
    customer_email,
    rating,
    message,
    responded_at,
    token,
    initial_response
  )
  select
    r.restaurant_id,
    r.id,
    coalesce(nullif(trim(p_customer_name), ''), r.guest_name, 'Client'),
    coalesce(nullif(trim(p_customer_email), ''), r.guest_email),
    p_rating,
    trim(p_message),
    now(),
    null,
    null
  from public.reservations r
  where r.id = p_reservation_id
    and r.restaurant_id = p_restaurant_id
    and r.status = 'completed';

  get diagnostics n = row_count;
  return n > 0;
end;
$$;

grant execute on function public.submit_feedback_legacy(uuid, uuid, int, text, text, text) to anon, authenticated;
