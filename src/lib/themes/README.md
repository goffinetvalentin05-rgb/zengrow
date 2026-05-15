# Thèmes page publique restaurant

L’implémentation vit dans `src/lib/themes/` (import `@/src/lib/themes/...`). Elle est décorrélée de la logique métier (réservation, contenu éditor, etc.) : un thème fournit des **tokens** (couleurs, typos, espacements, effets) et éventuellement des **composants de présentation** pour le rendu premium.

## Fichiers clés

| Fichier | Rôle |
|--------|------|
| `types.ts` | `DesignTokens`, `ThemeDefinition`, `ThemeColorOverrides` (JSON sûr côté BDD). |
| `registry.ts` | Liste des thèmes (`THEME_REGISTRY`), `normalizeThemeId`, `getThemeDefinition`, `listThemes`. |
| `merge-overrides.ts` | Fusion des surcharges dashboard dans les tokens. |
| `css-vars.ts` | Conversion tokens → variables CSS (`--page-bg`, `--accent-color`, `--zg-*`, …). |
| `resolve.ts` | `resolvePublicTheme`, `parseThemeOverrides` — utilisé par la page `/r/[slug]` et l’aperçu dashboard. |
| `shared/` | Effets réutilisables (`GrainOverlay`, `ImageWithVignette`). |

## Données restaurant (Supabase)

- `restaurants.theme_id` : identifiant du thème (`default`, `premium-dark`, `premium-elegant`, …).
- `restaurants.theme_overrides` : JSON, typiquement `{ "colors": { "accent": "#...", "bg": "#..." } }`.

## Ajouter un nouveau thème

1. **Créer un dossier** `src/lib/themes/<mon-theme>/`.
2. **`tokens.ts`** : exporter `monTheme: ThemeDefinition` avec `id`, `name`, `description`, `previewImage` (fichier dans `public/themes/<mon-theme>/preview.svg`), et `tokens: DesignTokens`.
3. **Enregistrer** le thème dans `registry.ts` (`THEME_REGISTRY` + contrat `ThemeId` dans `types.ts`).
4. **Composants** (optionnel) : si le rendu doit différer fortement, ajouter `components.tsx` (souvent client `use client`) et brancher les exports dans `PublicReservationForm` comme pour `premium-dark`.
5. **Preview dashboard** : l’image doit être accessible sous `public/themes/<id>/preview.svg` (ou autre format référencé dans `previewImage`).

Les thèmes non-`default` appliquent leurs variables CSS par-dessus l’éditeur ; le contenu et l’ordre des blocs restent inchangés.

## Police (layout global)

Les variables `--font-cormorant` et `--font-dancing` sont chargées dans `app/layout.tsx` pour les thèmes premium. Le corps utilise `--font-inter`.
