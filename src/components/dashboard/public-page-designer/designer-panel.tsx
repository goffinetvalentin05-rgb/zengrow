"use client";

import { useState } from "react";
import DesignerImageField from "@/src/components/dashboard/public-page-designer/designer-image-field";
import Input from "@/src/components/ui/input";
import Select from "@/src/components/ui/select";
import Textarea from "@/src/components/ui/textarea";
import Toggle from "@/src/components/ui/toggle";
import { storefrontContrastWarnings } from "@/src/lib/public-storefront/contrast";
import { applyStorefrontPreset, FONT_PAIRINGS, STOREFRONT_PRESET_META } from "@/src/lib/public-storefront/defaults";
import type { StorefrontIdentity } from "@/src/lib/public-storefront/identity";
import {
  BUTTON_FILLS,
  CONTENT_WIDTHS,
  COVER_HEIGHTS,
  FONT_PAIRING_IDS,
  FOOTER_SPACINGS,
  FOOTER_THEMES,
  HERO_ALIGNS,
  HERO_BACKGROUNDS,
  HERO_CTA_STYLES,
  HERO_FRAMES,
  HERO_LAYOUTS,
  ICON_STYLES,
  LOGO_SIZES,
  OFFER_BUTTON_PRESETS,
  OFFER_BUTTON_STYLES,
  OFFER_CARD_STYLES,
  OFFER_IMAGE_RATIOS,
  RADIUS_LEVELS,
  SPACINGS,
  STOREFRONT_PRESETS,
  TITLE_SIZES,
  type StorefrontConfig,
  type StorefrontPresetId,
} from "@/src/lib/public-storefront/schema";
import { cn } from "@/src/lib/utils";

const TABS = [
  { id: "style", label: "Style général" },
  { id: "hero", label: "Hero" },
  { id: "offers", label: "Offres" },
  { id: "footer", label: "Pied de page" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const HERO_LAYOUT_LABELS: Record<(typeof HERO_LAYOUTS)[number], { label: string; hint: string }> = {
  fullbleed: { label: "Pleine largeur", hint: "Texte sur l’image" },
  split: { label: "Séparés", hint: "Texte + image" },
  minimal: { label: "Centré minimal", hint: "Fond uni / dégradé" },
  immersive: { label: "Immersif", hint: "Premier écran" },
};

const CARD_LABELS: Record<(typeof OFFER_CARD_STYLES)[number], { label: string; hint: string }> = {
  classic: { label: "Classique", hint: "Image puis contenu" },
  immersive: { label: "Immersive", hint: "Texte sur l’image" },
  horizontal: { label: "Horizontale", hint: "Idéale expériences" },
  minimal: { label: "Minimaliste", hint: "Peu de bordure" },
  premium: { label: "Premium", hint: "Grand air, détails fins" },
};

type DesignerPanelProps = {
  restaurantId: string;
  config: StorefrontConfig;
  identity: StorefrontIdentity;
  onChange: (next: StorefrontConfig) => void;
};

export default function DesignerPanel({ restaurantId, config, identity, onChange }: DesignerPanelProps) {
  const [tab, setTab] = useState<TabId>("style");
  const warnings = storefrontContrastWarnings(config);

  function patch<K extends keyof StorefrontConfig>(key: K, value: StorefrontConfig[K]) {
    onChange({ ...config, [key]: value });
  }

  return (
    <div className="flex min-h-0 flex-col">
      <div className="mb-3 grid grid-cols-2 gap-1 rounded-xl border border-zg-border p-1">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "min-h-9 rounded-lg px-2 text-[11px] font-semibold",
              tab === item.id ? "bg-zg-surface-elevated text-zg-fg" : "text-zg-text-muted hover:text-zg-fg",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "style" ? (
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-semibold text-zg-fg">Presets</p>
            <div className="grid grid-cols-1 gap-2">
              {STOREFRONT_PRESETS.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => onChange(applyStorefrontPreset(config, id as StorefrontPresetId, identity))}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-left",
                    config.presetId === id ? "border-zg-accent bg-zg-accent/10" : "border-zg-border hover:border-zg-border-hover",
                  )}
                >
                  <p className="text-sm font-semibold text-zg-fg">{STOREFRONT_PRESET_META[id].label}</p>
                  <p className="text-xs text-zg-text-muted">{STOREFRONT_PRESET_META[id].hint}</p>
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-zg-text-muted">Le preset ne remplace ni le logo, ni les images, ni les offres.</p>
          </div>
          <label className="block text-xs font-semibold text-zg-fg">
            Combinaison de polices
            <Select className="mt-1" value={config.style.fontPairing} onChange={(e) => patch("style", { ...config.style, fontPairing: e.target.value as StorefrontConfig["style"]["fontPairing"] })}>
              {FONT_PAIRING_IDS.map((id) => (
                <option key={id} value={id}>
                  {FONT_PAIRINGS[id].label} — {FONT_PAIRINGS[id].heading} / {FONT_PAIRINGS[id].body}
                </option>
              ))}
            </Select>
          </label>
          <ColorField label="Couleur principale" value={config.style.primaryColor} onChange={(primaryColor) => patch("style", { ...config.style, primaryColor })} />
          <ColorField label="Accent" value={config.style.accentColor} onChange={(accentColor) => patch("style", { ...config.style, accentColor })} />
          <ColorField label="Fond" value={config.style.backgroundColor} onChange={(backgroundColor) => patch("style", { ...config.style, backgroundColor })} />
          <ColorField label="Texte principal" value={config.style.textColor} onChange={(textColor) => patch("style", { ...config.style, textColor })} />
          <ColorField label="Texte secondaire" value={config.style.mutedTextColor} onChange={(mutedTextColor) => patch("style", { ...config.style, mutedTextColor })} />
          <Segmented
            label="Thème"
            value={config.style.themeMode}
            options={[
              { id: "light", label: "Clair" },
              { id: "dark", label: "Sombre" },
            ]}
            onChange={(themeMode) =>
              patch("style", {
                ...config.style,
                themeMode,
                backgroundColor: themeMode === "dark" ? "#121110" : "#FAF7F2",
                textColor: themeMode === "dark" ? "#F5F1EA" : "#1C1917",
                mutedTextColor: themeMode === "dark" ? "#C4B5A5" : "#57534E",
              })
            }
          />
          <Segmented
            label="Boutons"
            value={config.style.buttonFill}
            options={BUTTON_FILLS.map((id) => ({ id, label: id === "filled" ? "Pleins" : "Contours" }))}
            onChange={(buttonFill) => patch("style", { ...config.style, buttonFill })}
          />
          <Segmented
            label="Arrondi"
            value={config.style.radius}
            options={RADIUS_LEVELS.map((id) => ({ id, label: id === "soft" ? "Léger" : id === "pill" ? "Pilule" : "Arrondi" }))}
            onChange={(radius) => patch("style", { ...config.style, radius })}
          />
          <Segmented
            label="Densité"
            value={config.style.spacing}
            options={SPACINGS.map((id) => ({ id, label: id === "compact" ? "Compacte" : id === "relaxed" ? "Aérée" : "Normale" }))}
            onChange={(spacing) => patch("style", { ...config.style, spacing })}
          />
          <Segmented
            label="Largeur globale"
            value={config.style.contentWidth}
            options={CONTENT_WIDTHS.map((id) => ({ id, label: id === "narrow" ? "Étroite" : id === "wide" ? "Large" : "Normale" }))}
            onChange={(contentWidth) => patch("style", { ...config.style, contentWidth })}
          />
          {warnings.length > 0 ? (
            <ul className="space-y-1 rounded-lg border border-amber-300/60 bg-amber-50 px-3 py-2 text-xs text-amber-950">
              {warnings.map((warning) => (
                <li key={warning.id}>{warning.message}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {tab === "hero" ? (
        <div className="space-y-4">
          <p className="text-xs font-semibold text-zg-fg">Disposition</p>
          <div className="grid grid-cols-2 gap-2">
            {HERO_LAYOUTS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => patch("hero", { ...config.hero, layout: id })}
                className={cn(
                  "rounded-xl border px-2.5 py-2 text-left",
                  config.hero.layout === id ? "border-zg-accent bg-zg-accent/10" : "border-zg-border",
                )}
              >
                <p className="text-xs font-semibold text-zg-fg">{HERO_LAYOUT_LABELS[id].label}</p>
                <p className="text-[11px] text-zg-text-muted">{HERO_LAYOUT_LABELS[id].hint}</p>
              </button>
            ))}
          </div>
          <Toggle checked={config.hero.showLogo} onChange={(showLogo) => patch("hero", { ...config.hero, showLogo })} label="Afficher le logo" />
          {config.hero.showLogo ? (
            <Segmented
              label="Taille du logo"
              value={config.hero.logoSize}
              options={LOGO_SIZES.map((id) => ({ id, label: id === "sm" ? "Petit" : id === "lg" ? "Grand" : "Moyen" }))}
              onChange={(logoSize) => patch("hero", { ...config.hero, logoSize })}
            />
          ) : null}
          <DesignerImageField
            restaurantId={restaurantId}
            folder="hero"
            label="Image de couverture"
            value={config.hero.coverImageUrl}
            focalX={config.hero.focalX}
            focalY={config.hero.focalY}
            onFocalChange={(focalX, focalY) => patch("hero", { ...config.hero, focalX, focalY })}
            onChange={(coverImageUrl) => patch("hero", { ...config.hero, coverImageUrl })}
          />
          <Segmented
            label="Hauteur"
            value={config.hero.height}
            options={COVER_HEIGHTS.map((id) => ({ id, label: id === "compact" ? "Compacte" : id === "immersive" ? "Immersive" : "Normale" }))}
            onChange={(height) => patch("hero", { ...config.hero, height })}
          />
          <Field label="Titre principal">
            <Input value={config.hero.title} maxLength={120} onChange={(e) => patch("hero", { ...config.hero, title: e.target.value })} />
          </Field>
          <Field label="Sous-titre">
            <Textarea value={config.hero.subtitle} maxLength={280} onChange={(e) => patch("hero", { ...config.hero, subtitle: e.target.value })} />
          </Field>
          <Segmented
            label="Alignement"
            value={config.hero.align}
            options={HERO_ALIGNS.map((id) => ({ id, label: id === "left" ? "Gauche" : "Centré" }))}
            onChange={(align) => patch("hero", { ...config.hero, align })}
          />
          <ColorField label="Couleur du texte" value={config.hero.textColor || "#FFFFFF"} onChange={(textColor) => patch("hero", { ...config.hero, textColor })} />
          <label className="block text-xs font-semibold text-zg-fg">
            Overlay ({config.hero.overlayOpacity}%)
            <input type="range" min={0} max={80} value={config.hero.overlayOpacity} className="mt-2 w-full" onChange={(e) => patch("hero", { ...config.hero, overlayOpacity: Number(e.target.value) })} />
          </label>
          <Toggle checked={config.hero.ctaVisible} onChange={(ctaVisible) => patch("hero", { ...config.hero, ctaVisible })} label="Bouton principal" />
          {config.hero.ctaVisible ? (
            <>
              <Field label="Texte du bouton">
                <Input value={config.hero.ctaText} maxLength={40} onChange={(e) => patch("hero", { ...config.hero, ctaText: e.target.value })} />
              </Field>
              <Segmented
                label="Style du bouton"
                value={config.hero.ctaStyle}
                options={HERO_CTA_STYLES.map((id) => ({ id, label: id === "filled" ? "Plein" : id === "outline" ? "Contour" : "Doux" }))}
                onChange={(ctaStyle) => patch("hero", { ...config.hero, ctaStyle })}
              />
              <p className="text-[11px] text-zg-text-muted">Le bouton mène toujours à la section des offres.</p>
            </>
          ) : null}
          <Segmented
            label="Fond"
            value={config.hero.background}
            options={HERO_BACKGROUNDS.map((id) => ({ id, label: id === "image" ? "Image" : id === "solid" ? "Uni" : "Dégradé" }))}
            onChange={(background) => patch("hero", { ...config.hero, background })}
          />
          <Segmented
            label="Cadre"
            value={config.hero.frame}
            options={HERO_FRAMES.map((id) => ({ id, label: id === "rounded" ? "Arrondi" : "Plein écran" }))}
            onChange={(frame) => patch("hero", { ...config.hero, frame })}
          />
          <Segmented
            label="Espacement intérieur"
            value={config.hero.padding}
            options={SPACINGS.map((id) => ({ id, label: id === "compact" ? "Compact" : id === "relaxed" ? "Aéré" : "Normal" }))}
            onChange={(padding) => patch("hero", { ...config.hero, padding })}
          />
        </div>
      ) : null}

      {tab === "offers" ? (
        <div className="space-y-4">
          <Field label="Titre de la section">
            <Input value={config.offers.title} maxLength={120} onChange={(e) => patch("offers", { ...config.offers, title: e.target.value })} />
          </Field>
          <Field label="Sous-titre (facultatif)">
            <Input value={config.offers.subtitle} maxLength={280} onChange={(e) => patch("offers", { ...config.offers, subtitle: e.target.value })} />
          </Field>
          <Segmented
            label="Alignement"
            value={config.offers.align}
            options={HERO_ALIGNS.map((id) => ({ id, label: id === "left" ? "Gauche" : "Centré" }))}
            onChange={(align) => patch("offers", { ...config.offers, align })}
          />
          <ColorField label="Fond de section" value={config.offers.backgroundColor || config.style.backgroundColor} onChange={(backgroundColor) => patch("offers", { ...config.offers, backgroundColor })} />
          <Segmented
            label="Espacement"
            value={config.offers.paddingY}
            options={SPACINGS.map((id) => ({ id, label: id === "compact" ? "Compact" : id === "relaxed" ? "Aéré" : "Normal" }))}
            onChange={(paddingY) => patch("offers", { ...config.offers, paddingY })}
          />
          <Segmented
            label="Largeur"
            value={config.offers.maxWidth}
            options={CONTENT_WIDTHS.map((id) => ({ id, label: id === "narrow" ? "Étroite" : id === "wide" ? "Large" : "Normale" }))}
            onChange={(maxWidth) => patch("offers", { ...config.offers, maxWidth })}
          />
          <Segmented
            label="Colonnes (ordinateur)"
            value={String(config.offers.columns)}
            options={[
              { id: "1", label: "1" },
              { id: "2", label: "2" },
              { id: "3", label: "3" },
            ]}
            onChange={(columns) => patch("offers", { ...config.offers, columns: Number(columns) as 1 | 2 | 3 })}
          />
          <p className="text-xs font-semibold text-zg-fg">Style des cartes</p>
          <div className="grid grid-cols-1 gap-2">
            {OFFER_CARD_STYLES.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => patch("offers", { ...config.offers, cardStyle: id })}
                className={cn(
                  "rounded-xl border px-3 py-2 text-left",
                  config.offers.cardStyle === id ? "border-zg-accent bg-zg-accent/10" : "border-zg-border",
                )}
              >
                <p className="text-sm font-semibold text-zg-fg">{CARD_LABELS[id].label}</p>
                <p className="text-[11px] text-zg-text-muted">{CARD_LABELS[id].hint}</p>
              </button>
            ))}
          </div>
          <Segmented
            label="Ratio image"
            value={config.offers.imageRatio}
            options={OFFER_IMAGE_RATIOS.map((id) => ({ id, label: id }))}
            onChange={(imageRatio) => patch("offers", { ...config.offers, imageRatio })}
          />
          <Segmented
            label="Taille des titres"
            value={config.offers.titleSize}
            options={TITLE_SIZES.map((id) => ({ id, label: id === "sm" ? "Petit" : id === "lg" ? "Grand" : "Moyen" }))}
            onChange={(titleSize) => patch("offers", { ...config.offers, titleSize })}
          />
          <Toggle checked={config.offers.showDescription} onChange={(showDescription) => patch("offers", { ...config.offers, showDescription })} label="Description courte" />
          <Toggle checked={config.offers.showPrice} onChange={(showPrice) => patch("offers", { ...config.offers, showPrice })} label="Prix / valeur" />
          <Segmented
            label="Style des boutons"
            value={config.offers.buttonStyle}
            options={OFFER_BUTTON_STYLES.map((id) => ({ id, label: id === "filled" ? "Plein" : id === "outline" ? "Contour" : "Discret" }))}
            onChange={(buttonStyle) => patch("offers", { ...config.offers, buttonStyle })}
          />
          <label className="block text-xs font-semibold text-zg-fg">
            Texte des boutons
            <Select className="mt-1" value={config.offers.buttonPreset} onChange={(e) => patch("offers", { ...config.offers, buttonPreset: e.target.value as StorefrontConfig["offers"]["buttonPreset"] })}>
              {OFFER_BUTTON_PRESETS.map((id) => (
                <option key={id} value={id}>
                  {id === "offrir" ? "Offrir" : id === "decouvrir" ? "Découvrir" : id === "choisir" ? "Choisir ce bon" : "Personnalisé"}
                </option>
              ))}
            </Select>
          </label>
          {config.offers.buttonPreset === "custom" ? (
            <Field label="Texte personnalisé">
              <Input value={config.offers.customButtonText} maxLength={40} onChange={(e) => patch("offers", { ...config.offers, customButtonText: e.target.value })} />
            </Field>
          ) : null}
          <p className="text-[11px] text-zg-text-muted">Une seule offre est automatiquement centrée. Les titres et images se gèrent dans Mes offres.</p>
        </div>
      ) : null}

      {tab === "footer" ? (
        <div className="space-y-4">
          <Segmented
            label="Ambiance"
            value={config.footer.theme}
            options={FOOTER_THEMES.map((id) => ({ id, label: id === "dark" ? "Sombre" : "Clair" }))}
            onChange={(theme) => patch("footer", { ...config.footer, theme })}
          />
          <Segmented
            label="Alignement"
            value={config.footer.align}
            options={HERO_ALIGNS.map((id) => ({ id, label: id === "left" ? "Gauche" : "Centré" }))}
            onChange={(align) => patch("footer", { ...config.footer, align })}
          />
          <Toggle checked={config.footer.showLogo} onChange={(showLogo) => patch("footer", { ...config.footer, showLogo })} label="Logo" />
          <Toggle checked={config.footer.showContact} onChange={(showContact) => patch("footer", { ...config.footer, showContact })} label="Coordonnées" />
          {config.footer.showContact ? (
            <>
              <Toggle checked={config.footer.showAddress} onChange={(showAddress) => patch("footer", { ...config.footer, showAddress })} label="Adresse" />
              <Toggle checked={config.footer.showPhone} onChange={(showPhone) => patch("footer", { ...config.footer, showPhone })} label="Téléphone" />
              <Toggle checked={config.footer.showEmail} onChange={(showEmail) => patch("footer", { ...config.footer, showEmail })} label="E-mail" />
              <Toggle checked={config.footer.showWebsite} onChange={(showWebsite) => patch("footer", { ...config.footer, showWebsite })} label="Site" />
            </>
          ) : null}
          <Toggle checked={config.footer.showSocial} onChange={(showSocial) => patch("footer", { ...config.footer, showSocial })} label="Réseaux sociaux" />
          <Segmented
            label="Style des icônes"
            value={config.footer.iconStyle}
            options={ICON_STYLES.map((id) => ({ id, label: id === "plain" ? "Simples" : id === "circle" ? "Cercles" : "Carrés" }))}
            onChange={(iconStyle) => patch("footer", { ...config.footer, iconStyle })}
          />
          <ColorField label="Fond" value={config.footer.backgroundColor || (config.footer.theme === "dark" ? "#171412" : config.style.backgroundColor)} onChange={(backgroundColor) => patch("footer", { ...config.footer, backgroundColor })} />
          <ColorField label="Texte" value={config.footer.textColor || config.style.textColor} onChange={(textColor) => patch("footer", { ...config.footer, textColor })} />
          <Segmented
            label="Espacement"
            value={config.footer.spacing}
            options={FOOTER_SPACINGS.map((id) => ({ id, label: id === "compact" ? "Compact" : "Confortable" }))}
            onChange={(spacing) => patch("footer", { ...config.footer, spacing })}
          />
          <p className="text-[11px] text-zg-text-muted">Les icônes n’apparaissent que si le lien existe dans Paramètres → Établissement. La mention ZenGrow reste discrète.</p>
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1 text-xs font-semibold text-zg-fg">
      {label}
      {children}
    </label>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const hex = /^#[0-9A-Fa-f]{6}$/.test(value) ? value : "#000000";
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-zg-fg">{label}</p>
      <div className="flex items-center gap-2">
        <input type="color" value={hex} onChange={(e) => onChange(e.target.value)} className="h-9 w-11 cursor-pointer rounded-lg border border-zg-border bg-transparent p-1" />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="font-mono text-xs" />
      </div>
    </div>
  );
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold text-zg-fg">{label}</p>
      <div className="flex flex-wrap gap-1 rounded-lg border border-zg-border p-0.5">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={cn(
              "min-h-8 flex-1 rounded-md px-2 text-[11px] font-medium",
              value === option.id ? "bg-zg-surface-elevated text-zg-fg" : "text-zg-text-muted hover:text-zg-fg",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
