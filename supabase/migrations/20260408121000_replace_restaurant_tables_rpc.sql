-- Remplacement atomique des tables (évite un état vide si l'insert échoue après delete)

create or replace function public.replace_restaurant_tables(
  p_restaurant_id uuid,
  p_tables jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid;
begin
  select owner_id into v_owner from public.restaurants where id = p_restaurant_id;
  if v_owner is null then
    raise exception 'RESTAURANT_NOT_FOUND';
  end if;
  if v_owner is distinct from auth.uid() then
    raise exception 'FORBIDDEN';
  end if;

  delete from public.restaurant_tables where restaurant_id = p_restaurant_id;

  if p_tables is null or jsonb_typeof(p_tables) <> 'array' or jsonb_array_length(p_tables) = 0 then
    return;
  end if;

  insert into public.restaurant_tables (restaurant_id, name, min_covers, max_covers)
  select
    p_restaurant_id,
    btrim(t->>'name'),
    greatest(1, least(20, coalesce((t->>'min_covers')::integer, 1))),
    greatest(1, least(20, coalesce((t->>'max_covers')::integer, 1)))
  from jsonb_array_elements(p_tables) as t;
end;
$$;

grant execute on function public.replace_restaurant_tables(uuid, jsonb) to authenticated;
