-- Showroom v2 — alias des thèmes legacy vers les nouveaux templates de conversion
UPDATE restaurants
SET theme_id = 'elegant-light'
WHERE theme_id IN ('default', 'premium-elegant');

COMMENT ON COLUMN restaurants.theme_id IS
  'Template Showroom: premium-dark | elegant-light | social-bold | minimal-chic (+ legacy premium-elegant, default)';
