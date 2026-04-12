-- Les walk-ins ne sont pas des « clients » CRM : pas de fiche client ni de customer_id.

create or replace function public.zengrow_refresh_customer_metrics(p_customer_id uuid)
returns void
language plpgsql
as $$
begin
  if p_customer_id is null then
    return;
  end if;

  update public.customers c
  set
    reservation_count = agg.reservation_count,
    total_visits = agg.total_visits,
    last_visit_at = agg.last_visit_at,
    updated_at = now()
  from (
    select
      count(*)::integer as reservation_count,
      count(*) filter (where status = 'completed')::integer as total_visits,
      max(
        case
          when status = 'completed'
          then ((reservation_date::text || ' ' || reservation_time)::timestamp)::timestamptz
          else null
        end
      ) as last_visit_at
    from public.reservations
    where customer_id = p_customer_id
      and coalesce(reservation_type, 'standard') <> 'walkin'
  ) agg
  where c.id = p_customer_id;
end;
$$;

create or replace function public.zengrow_attach_customer_to_reservation()
returns trigger
language plpgsql
as $$
begin
  if coalesce(new.reservation_type, 'standard') = 'walkin' then
    new.customer_id := null;
    return new;
  end if;

  new.customer_id := public.zengrow_resolve_customer(
    new.restaurant_id,
    new.guest_name,
    new.guest_email,
    new.guest_phone
  );
  return new;
end;
$$;

drop trigger if exists zengrow_attach_customer_trigger on public.reservations;
create trigger zengrow_attach_customer_trigger
before insert or update of guest_name, guest_email, guest_phone, restaurant_id, reservation_type
on public.reservations
for each row
execute function public.zengrow_attach_customer_to_reservation();

-- Détacher les walk-ins déjà en base (déclenche le trigger de métriques sur l’ancien client).
update public.reservations
set customer_id = null
where coalesce(reservation_type, 'standard') = 'walkin'
  and customer_id is not null;

-- Fiches sans aucune résa « standard » liée (ex. uniquement des walk-ins avant correctif) → compteurs à zéro.
update public.customers c
set
  reservation_count = 0,
  total_visits = 0,
  last_visit_at = null,
  updated_at = now()
where not exists (
  select 1
  from public.reservations r
  where r.customer_id = c.id
    and coalesce(r.reservation_type, 'standard') <> 'walkin'
);

-- Recalculer les fiches encore liées à des réservations hors walk-in.
update public.customers c
set
  reservation_count = agg.reservation_count,
  total_visits = agg.total_visits,
  last_visit_at = agg.last_visit_at,
  updated_at = now()
from (
  select
    customer_id,
    count(*)::integer as reservation_count,
    count(*) filter (where status = 'completed')::integer as total_visits,
    max(
      case
        when status = 'completed'
        then ((reservation_date::text || ' ' || reservation_time)::timestamp)::timestamptz
        else null
      end
    ) as last_visit_at
  from public.reservations
  where customer_id is not null
    and coalesce(reservation_type, 'standard') <> 'walkin'
  group by customer_id
) agg
where c.id = agg.customer_id;
