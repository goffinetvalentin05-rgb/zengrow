"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DesignerImageField from "@/src/components/dashboard/public-page-designer/designer-image-field";
import Input from "@/src/components/ui/input";
import Select from "@/src/components/ui/select";
import Textarea from "@/src/components/ui/textarea";
import Toggle from "@/src/components/ui/toggle";
import { storefrontContrastWarnings } from "@/src/lib/public-storefront/contrast";
import { applyStorefrontTemplate } from "@/src/lib/public-storefront/defaults";
import type { StorefrontIdentity } from "@/src/lib/public-storefront/identity";
import {
  BUTTON_STYLES,
  CARD_STYLES,
  CONTENT_WIDTHS,
  COVER_HEIGHTS,
  HERO_ALIGNS,
  HERO_CTA_TARGETS,
  MAX_GALLERY_IMAGES,
  OFFER_BUTTON_PRESETS,
  OFFER_IMAGE_RATIOS,
  OFFER_LAYOUTS,
  OFFER_ORIENTATIONS,
  SPACINGS,
  STOREFRONT_FONTS,
  STOREFRONT_TEMPLATES,
  type StorefrontConfig,
  type StorefrontSectionId,
  type StorefrontTemplateId,
} from "@/src/lib/public-storefront/schema";
import { cn } from "@/src/lib/utils";

const SECTION_LABELS: Record<StorefrontSectionId, string> = {
  hero: "Hero",
  offers: "Offres de bons cadeaux",
  about: "À propos de l’établissement",
  gallery: "Galerie",
  practical: "Informations pratiques",
  hours: "Horaires",
  contact: "Coordonnées",
  social: "Réseaux sociaux",
  map: "Carte / adresse",
  footer: "Pied de page",
};

const TEMPLATE_COPY: Record<StorefrontTemplateId, { label: string; hint: string }> = {
  elegant: { label: "Élégant", hint: "Grandes images, typographie raffinée" },
  modern: { label: "Moderne", hint: "Cartes nettes, couleurs affirmées" },
  minimal: { label: "Minimal", hint: "Épuré, priorité aux offres" },
};

type DesignerPanelProps = {
  restaurantId: string;
  config: StorefrontConfig;
  identity: StorefrontIdentity;
  onChange: (next: StorefrontConfig) => void;
};

export default function DesignerPanel({ restaurantId, config, identity, onChange }: DesignerPanelProps) {
  const warnings = storefrontContrastWarnings(config);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function patch<K extends keyof StorefrontConfig>(key: K, value: StorefrontConfig[K]) {
    onChange({ ...config, [key]: value });
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = config.sections.map((section) => section.id);
    const oldIndex = ids.indexOf(String(active.id) as StorefrontSectionId);
    const newIndex = ids.indexOf(String(over.id) as StorefrontSectionId);
    if (oldIndex < 0 || newIndex < 0) return;
    patch("sections", arrayMove(config.sections, oldIndex, newIndex));
  }

  return (
    <div className="space-y-3 pb-10">
      <Category title="Modèles">
        <div className="grid grid-cols-1 gap-2">
          {STOREFRONT_TEMPLATES.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => onChange(applyStorefrontTemplate(config, id, identity))}
              className={cn(
                "rounded-xl border px-3 py-2.5 text-left",
                config.templateId === id ? "border-zg-accent bg-zg-accent/10" : "border-zg-border hover:border-zg-border-hover",
              )}
            >
              <p className="text-sm font-semibold text-zg-fg">{TEMPLATE_COPY[id].label}</p>
              <p className="text-xs text-zg-text-muted">{TEMPLATE_COPY[id].hint}</p>
            </button>
          ))}
        </div>
        <p className="text-[11px] text-zg-text-muted">Le modèle change le style, pas les offres ni les infos de l’établissement.</p>
      </Category>

      <Category title="Style" defaultOpen>
        <ColorField label="Couleur principale" value={config.style.primaryColor} onChange={(primaryColor) => patch("style", { ...config.style, primaryColor })} />
        <ColorField
          label="Couleur secondaire"
          value={config.style.secondaryColor ?? "#E85D2C"}
          optional
          enabled={Boolean(config.style.secondaryColor)}
          onEnabled={(on) => patch("style", { ...config.style, secondaryColor: on ? "#E85D2C" : null })}
          onChange={(secondaryColor) => patch("style", { ...config.style, secondaryColor })}
        />
        <ColorField label="Fond" value={config.style.backgroundColor} onChange={(backgroundColor) => patch("style", { ...config.style, backgroundColor })} />
        <ColorField label="Texte" value={config.style.textColor} onChange={(textColor) => patch("style", { ...config.style, textColor })} />
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
            })
          }
        />
        <label className="block text-xs font-semibold text-zg-fg">
          Police
          <Select className="mt-1" value={config.style.font} onChange={(e) => patch("style", { ...config.style, font: e.target.value as StorefrontConfig["style"]["font"] })}>
            {STOREFRONT_FONTS.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </Select>
        </label>
        <Segmented
          label="Boutons"
          value={config.style.buttonStyle}
          options={BUTTON_STYLES.map((id) => ({ id, label: id === "soft" ? "Légèrement arrondi" : id === "rounded" ? "Arrondi" : "Pilule" }))}
          onChange={(buttonStyle) => patch("style", { ...config.style, buttonStyle })}
        />
        <Segmented
          label="Cartes"
          value={config.style.cardStyle}
          options={CARD_STYLES.map((id) => ({ id, label: id === "border" ? "Bordure" : id === "shadow" ? "Légère ombre" : "Minimal" }))}
          onChange={(cardStyle) => patch("style", { ...config.style, cardStyle })}
        />
        <Segmented
          label="Largeur"
          value={config.style.contentWidth}
          options={CONTENT_WIDTHS.map((id) => ({ id, label: id === "narrow" ? "Étroite" : id === "wide" ? "Large" : "Normale" }))}
          onChange={(contentWidth) => patch("style", { ...config.style, contentWidth })}
        />
        <Segmented
          label="Espacement"
          value={config.style.spacing}
          options={SPACINGS.map((id) => ({ id, label: id === "compact" ? "Compact" : id === "relaxed" ? "Aéré" : "Normal" }))}
          onChange={(spacing) => patch("style", { ...config.style, spacing })}
        />
        {warnings.length > 0 ? (
          <ul className="space-y-1 rounded-lg border border-amber-300/60 bg-amber-50 px-3 py-2 text-xs text-amber-950">
            {warnings.map((warning) => (
              <li key={warning.id}>{warning.message}</li>
            ))}
          </ul>
        ) : null}
      </Category>

      <Category title="En-tête / Hero" defaultOpen>
        <Toggle checked={config.hero.showLogo} onChange={(showLogo) => patch("hero", { ...config.hero, showLogo })} label="Afficher le logo" />
        <DesignerImageField restaurantId={restaurantId} folder="hero" label="Image de couverture" value={config.hero.coverImageUrl} onChange={(coverImageUrl) => patch("hero", { ...config.hero, coverImageUrl })} />
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
        <Segmented
          label="Hauteur de couverture"
          value={config.hero.coverHeight}
          options={COVER_HEIGHTS.map((id) => ({ id, label: id === "compact" ? "Compacte" : id === "tall" ? "Haute" : "Normale" }))}
          onChange={(coverHeight) => patch("hero", { ...config.hero, coverHeight })}
        />
        <Toggle checked={config.hero.overlayEnabled} onChange={(overlayEnabled) => patch("hero", { ...config.hero, overlayEnabled })} label="Effet sombre sur l’image" />
        {config.hero.overlayEnabled ? (
          <label className="block text-xs font-semibold text-zg-fg">
            Intensité ({config.hero.overlayOpacity}%)
            <input
              type="range"
              min={20}
              max={80}
              value={config.hero.overlayOpacity}
              className="mt-2 w-full"
              onChange={(e) => patch("hero", { ...config.hero, overlayOpacity: Number(e.target.value) })}
            />
          </label>
        ) : null}
        <Toggle checked={config.hero.ctaVisible} onChange={(ctaVisible) => patch("hero", { ...config.hero, ctaVisible })} label="Bouton principal" />
        {config.hero.ctaVisible ? (
          <>
            <Field label="Texte du bouton">
              <Input value={config.hero.ctaText} maxLength={40} onChange={(e) => patch("hero", { ...config.hero, ctaText: e.target.value })} />
            </Field>
            <label className="block text-xs font-semibold text-zg-fg">
              Destination
              <Select className="mt-1" value={config.hero.ctaTarget} onChange={(e) => patch("hero", { ...config.hero, ctaTarget: e.target.value as StorefrontConfig["hero"]["ctaTarget"] })}>
                {HERO_CTA_TARGETS.map((id) => (
                  <option key={id} value={id}>
                    {SECTION_LABELS[id === "offers" ? "offers" : id === "about" ? "about" : id === "contact" ? "contact" : id === "hours" ? "hours" : "map"]}
                  </option>
                ))}
              </Select>
            </label>
          </>
        ) : null}
        <Toggle checked={config.hero.showAddress} onChange={(showAddress) => patch("hero", { ...config.hero, showAddress })} label="Afficher l’adresse" />
        <Toggle checked={config.hero.showCategory} onChange={(showCategory) => patch("hero", { ...config.hero, showCategory })} label="Afficher la catégorie" />
      </Category>

      <Category title="Bons cadeaux">
        <Field label="Titre de la section">
          <Input value={config.offers.title} maxLength={120} onChange={(e) => patch("offers", { ...config.offers, title: e.target.value })} />
        </Field>
        <Field label="Sous-titre">
          <Input value={config.offers.subtitle} maxLength={280} onChange={(e) => patch("offers", { ...config.offers, subtitle: e.target.value })} />
        </Field>
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
        <Segmented
          label="Disposition"
          value={config.offers.layout}
          options={OFFER_LAYOUTS.map((id) => ({ id, label: id === "grid" ? "Grille" : "Liste" }))}
          onChange={(layout) => patch("offers", { ...config.offers, layout })}
        />
        <Segmented
          label="Cartes"
          value={config.offers.cardOrientation}
          options={OFFER_ORIENTATIONS.map((id) => ({ id, label: id === "vertical" ? "Verticales" : "Horizontales" }))}
          onChange={(cardOrientation) => patch("offers", { ...config.offers, cardOrientation })}
        />
        <Segmented
          label="Ratio image"
          value={config.offers.imageRatio}
          options={OFFER_IMAGE_RATIOS.map((id) => ({ id, label: id }))}
          onChange={(imageRatio) => patch("offers", { ...config.offers, imageRatio })}
        />
        <Toggle checked={config.offers.showDescription} onChange={(showDescription) => patch("offers", { ...config.offers, showDescription })} label="Description courte" />
        <Toggle checked={config.offers.showPrice} onChange={(showPrice) => patch("offers", { ...config.offers, showPrice })} label="Prix / valeur" />
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
        <p className="text-[11px] text-zg-text-muted">
          Titres, prix et images des offres se gèrent dans{" "}
          <Link href="/dashboard/gift-vouchers/offers" className="font-medium text-zg-accent hover:underline">
            Mes offres
          </Link>
          .
        </p>
      </Category>

      <Category title="Sections">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={config.sections.map((section) => section.id)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-1.5">
              {config.sections.map((section, index) => (
                <SortableSection
                  key={section.id}
                  section={section}
                  index={index}
                  total={config.sections.length}
                  onToggle={(enabled) =>
                    patch(
                      "sections",
                      config.sections.map((item) => (item.id === section.id ? { ...item, enabled } : item)),
                    )
                  }
                  onMove={(dir) => {
                    const next = index + dir;
                    if (next < 0 || next >= config.sections.length) return;
                    patch("sections", arrayMove(config.sections, index, next));
                  }}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      </Category>

      <Category title="À propos">
        <Field label="Titre">
          <Input value={config.about.title} maxLength={120} onChange={(e) => patch("about", { ...config.about, title: e.target.value })} />
        </Field>
        <Field label="Texte">
          <Textarea value={config.about.body} maxLength={4000} rows={6} onChange={(e) => patch("about", { ...config.about, body: e.target.value })} />
        </Field>
        <DesignerImageField restaurantId={restaurantId} folder="sections" label="Image (facultative)" value={config.about.imageUrl} ratio={4 / 3} onChange={(imageUrl) => patch("about", { ...config.about, imageUrl })} />
        <Segmented
          label="Disposition"
          value={config.about.imagePlacement}
          options={[
            { id: "left", label: "Image à gauche" },
            { id: "right", label: "Image à droite" },
            { id: "none", label: "Sans image" },
          ]}
          onChange={(imagePlacement) => patch("about", { ...config.about, imagePlacement })}
        />
      </Category>

      <Category title="Galerie">
        <div className="space-y-3">
          {config.gallery.images.map((url, index) => (
            <div key={`${url}-${index}`} className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-14 w-20 rounded-lg object-cover" />
              <div className="flex flex-1 justify-end gap-1">
                <button type="button" className="rounded-lg p-1.5 text-zg-text-muted hover:bg-zg-surface" aria-label="Monter" disabled={index === 0} onClick={() => patch("gallery", { images: arrayMove(config.gallery.images, index, index - 1) })}>
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button type="button" className="rounded-lg p-1.5 text-zg-text-muted hover:bg-zg-surface" aria-label="Descendre" disabled={index === config.gallery.images.length - 1} onClick={() => patch("gallery", { images: arrayMove(config.gallery.images, index, index + 1) })}>
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="rounded-lg p-1.5 text-zg-danger hover:bg-zg-surface"
                  onClick={() => patch("gallery", { images: config.gallery.images.filter((_, i) => i !== index) })}
                >
                  Retirer
                </button>
              </div>
            </div>
          ))}
          {config.gallery.images.length < MAX_GALLERY_IMAGES ? (
            <DesignerImageField
              restaurantId={restaurantId}
              folder="gallery"
              label={`Ajouter une photo (${config.gallery.images.length}/${MAX_GALLERY_IMAGES})`}
              value=""
              ratio={4 / 3}
              onChange={(url) => {
                if (!url) return;
                patch("gallery", { images: [...config.gallery.images, url] });
              }}
            />
          ) : (
            <p className="text-xs text-zg-text-muted">Limite de {MAX_GALLERY_IMAGES} images atteinte.</p>
          )}
        </div>
      </Category>

      <Category title="Informations pratiques">
        <p className="text-[11px] text-zg-text-muted">Les valeurs viennent de Paramètres → Établissement.</p>
        <Toggle checked={config.practical.showAddress} onChange={(showAddress) => patch("practical", { ...config.practical, showAddress })} label="Adresse" />
        <Toggle checked={config.practical.showPhone} onChange={(showPhone) => patch("practical", { ...config.practical, showPhone })} label="Téléphone" />
        <Toggle checked={config.practical.showEmail} onChange={(showEmail) => patch("practical", { ...config.practical, showEmail })} label="E-mail" />
        <Toggle checked={config.practical.showWebsite} onChange={(showWebsite) => patch("practical", { ...config.practical, showWebsite })} label="Site" />
        <Toggle checked={config.practical.showHours} onChange={(showHours) => patch("practical", { ...config.practical, showHours })} label="Horaires" />
        <Toggle checked={config.practical.showInstagram} onChange={(showInstagram) => patch("practical", { ...config.practical, showInstagram })} label="Instagram" />
        <Toggle checked={config.practical.showFacebook} onChange={(showFacebook) => patch("practical", { ...config.practical, showFacebook })} label="Facebook" />
      </Category>

      <Category title="Pied de page">
        <Toggle checked={config.footer.showLogo} onChange={(showLogo) => patch("footer", { ...config.footer, showLogo })} label="Afficher le logo" />
        <Field label="Court texte">
          <Input value={config.footer.text} maxLength={280} onChange={(e) => patch("footer", { ...config.footer, text: e.target.value })} />
        </Field>
        <Toggle checked={config.footer.showContact} onChange={(showContact) => patch("footer", { ...config.footer, showContact })} label="Coordonnées" />
        <Toggle checked={config.footer.showSocial} onChange={(showSocial) => patch("footer", { ...config.footer, showSocial })} label="Réseaux sociaux" />
        <p className="text-[11px] text-zg-text-muted">La mention « Propulsé par ZenGrow » reste affichée de façon discrète.</p>
      </Category>
    </div>
  );
}

function SortableSection({
  section,
  index,
  total,
  onToggle,
  onMove,
}: {
  section: StorefrontConfig["sections"][number];
  index: number;
  total: number;
  onToggle: (enabled: boolean) => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex items-center gap-2 rounded-lg border border-zg-border bg-zg-surface px-2 py-1.5"
    >
      <button type="button" className="cursor-grab text-zg-text-muted" aria-label="Réordonner" {...attributes} {...listeners}>
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="min-w-0 flex-1 truncate text-xs font-medium text-zg-fg">{SECTION_LABELS[section.id]}</span>
      <button type="button" className="rounded p-1 text-zg-text-muted hover:bg-zg-app" aria-label="Monter" disabled={index === 0} onClick={() => onMove(-1)}>
        <ChevronUp className="h-3.5 w-3.5" />
      </button>
      <button type="button" className="rounded p-1 text-zg-text-muted hover:bg-zg-app" aria-label="Descendre" disabled={index === total - 1} onClick={() => onMove(1)}>
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      <Toggle checked={section.enabled} onChange={onToggle} />
    </li>
  );
}

function Category({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <details
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className="rounded-xl border border-zg-border bg-zg-surface"
    >
      <summary className="cursor-pointer list-none px-3 py-2.5 text-sm font-semibold text-zg-fg [&::-webkit-details-marker]:hidden">
        {title}
      </summary>
      <div className="space-y-3 border-t border-zg-border px-3 py-3">{children}</div>
    </details>
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

function ColorField({
  label,
  value,
  onChange,
  optional,
  enabled,
  onEnabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  optional?: boolean;
  enabled?: boolean;
  onEnabled?: (on: boolean) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-zg-fg">{label}</p>
        {optional && onEnabled ? <Toggle checked={Boolean(enabled)} onChange={onEnabled} /> : null}
      </div>
      {!optional || enabled ? (
        <div className="flex items-center gap-2">
          <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-11 cursor-pointer rounded-lg border border-zg-border bg-transparent p-1" />
          <Input value={value} onChange={(e) => onChange(e.target.value)} className="font-mono text-xs" />
        </div>
      ) : null}
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
