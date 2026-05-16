export type ThemeId = "default" | "premium-dark" | "premium-elegant";

export type ColorTokens = {
  bg: string;
  bgElevated: string;
  surface: string;
  accent: string;
  accentMuted: string;
  text: string;
  textMuted: string;
  border: string;
};

export type FontTokens = {
  display: string;
  script: string;
  body: string;
};

export type SpacingTokens = {
  sectionY: string;
  containerX: string;
};

export type RadiusTokens = {
  sm: string;
  md: string;
  pill: string;
};

export type EffectsTokens = {
  grain: boolean;
  vignette: boolean;
  imageOverlay: string;
};

export type DesignTokens = {
  colors: ColorTokens;
  fonts: FontTokens;
  spacing: SpacingTokens;
  radius: RadiusTokens;
  effects: EffectsTokens;
};

export type ThemeDefinition = {
  id: ThemeId;
  name: string;
  description: string;
  /** Chemin public (ex. /themes/premium-dark/preview.webp) */
  previewImage: string;
  tokens: DesignTokens;
};

/** Sous-ensemble autorisé pour `theme_overrides` (JSONB). */
export type ThemeColorOverrides = {
  colors?: Partial<Pick<ColorTokens, "accent" | "bg" | "bgElevated" | "text" | "textMuted">>;
};
