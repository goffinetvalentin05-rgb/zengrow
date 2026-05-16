-- =============================================================================
-- ROLLBACK ÉTAPE 1 (urgence, fenêtre ~30 jours)
-- Écrase les données courantes des 4 tables floor plan depuis *_backup.
-- Ne restaure PAS reservation_mode ni service_*_max_covers.
-- =============================================================================

do $$
declare
  v_cols text;
begin
  if to_regclass('public.restaurant_tables_backup') is null then
    raise exception 'BACKUP_MISSING: restaurant_tables_backup';
  end if;

  select string_agg(format('%I', c.column_name), ', ' order by c.ordinal_position)
  into v_cols
  from information_schema.columns c
  where c.table_schema = 'public'
    and c.table_name = 'restaurant_tables';

  truncate public.floor_plan_elements;
  truncate public.restaurant_tables cascade;
  truncate public.restaurant_zones;
  truncate public.floor_plans;

  execute format(
    'insert into public.restaurant_tables (%s) select %s from public.restaurant_tables_backup',
    v_cols,
    v_cols
  );

  select string_agg(format('%I', c.column_name), ', ' order by c.ordinal_position)
  into v_cols
  from information_schema.columns c
  where c.table_schema = 'public'
    and c.table_name = 'floor_plans';

  execute format(
    'insert into public.floor_plans (%s) select %s from public.floor_plans_backup',
    v_cols,
    v_cols
  );

  select string_agg(format('%I', c.column_name), ', ' order by c.ordinal_position)
  into v_cols
  from information_schema.columns c
  where c.table_schema = 'public'
    and c.table_name = 'floor_plan_elements';

  execute format(
    'insert into public.floor_plan_elements (%s) select %s from public.floor_plan_elements_backup',
    v_cols,
    v_cols
  );

  select string_agg(format('%I', c.column_name), ', ' order by c.ordinal_position)
  into v_cols
  from information_schema.columns c
  where c.table_schema = 'public'
    and c.table_name = 'restaurant_zones';

  execute format(
    'insert into public.restaurant_zones (%s) select %s from public.restaurant_zones_backup',
    v_cols,
    v_cols
  );
end $$;
