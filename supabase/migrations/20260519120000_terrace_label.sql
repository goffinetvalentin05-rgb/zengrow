-- Label personnalisable pour la terrasse (affichage client, étape 3+).

alter table public.restaurant_settings
  add column if not exists terrace_label text not null default 'Terrasse';

alter table public.restaurant_settings
  drop constraint if exists restaurant_settings_terrace_label_check;

alter table public.restaurant_settings
  add constraint restaurant_settings_terrace_label_check
  check (char_length(trim(terrace_label)) between 1 and 40);

update public.restaurant_settings
set terrace_label = 'Terrasse'
where terrace_label is null or trim(terrace_label) = '';
