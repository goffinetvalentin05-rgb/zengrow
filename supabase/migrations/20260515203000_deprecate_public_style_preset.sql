-- Dépréciation documentaire : les thèmes ZenGrow / Premium Dark / Elegant pilotent désormais
-- la direction visuelle (voir theme_id). Cette colonne reste pour compatibilité / données existantes.
comment on column public.restaurants.public_style_preset is
  'DEPRECATED: ancienne inspiration dashboard ; préférer theme_id + public_page_editor_config (conversion.structureTemplate). Valeur conservée pour historique.';
