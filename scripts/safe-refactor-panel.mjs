import fs from "fs";

const p = "c:/Users/Goffi/zengrow/src/components/dashboard/settings/public-page-settings-panel.tsx";
let s = fs.readFileSync(p, "utf8");
const linesBefore = s.split("\n").length;

// 1. Imports
s = s.replace(
  `import PublicPageLivePreview, { type PublicPagePreviewDraft } from "@/src/components/dashboard/public-page-live-preview";`,
  `import PublicPagePreviewStudio, { type ExtendedPreviewDraft } from "@/src/components/dashboard/settings/public-page-preview-studio";
import { SettingsAccordion } from "@/src/components/dashboard/settings/settings-accordion";
import {
  type PublicPageEditorConfig,
  parseEditorConfig,
  editorConfigToPreviewDraft,
  type EditorContext,
  PAGE_BLOCK_IDS,
  legacyHeroHeight,
} from "@/src/lib/public-page/editor-config";`,
);

// 2. TABS -> BLOCK_LABELS
s = s.replace(
  `const TABS = [
  { id: "identity", label: "Identité" },
  { id: "appearance", label: "Apparence" },
  { id: "photos", label: "Photos" },
  { id: "content", label: "Contenu" },
  { id: "reservation", label: "Réservation" },
  { id: "seo", label: "SEO & partage" },
  { id: "publish", label: "Publication" },
] as const;

type TabId = (typeof TABS)[number]["id"];

`,
  `const BLOCK_LABELS: Record<string, string> = {
  trust: "Confiance (points forts)",
  reservation: "Réservation",
  gallery: "Galerie photos",
  about: "À propos",
  highlights: "Points forts",
  menu: "Menu",
  hours: "Horaires",
  reviews: "Avis / note",
  location: "Localisation",
  social: "Réseaux sociaux",
  final_cta: "CTA final",
};

`,
);

if (!s.includes("editorConfigRaw")) {
  s = s.replace(
    "  terraceEnabled: boolean;\n};",
    "  terraceEnabled: boolean;\n  editorConfigRaw?: unknown;\n};",
  );
}

// 3. TabButton
s = s.replace(/function TabButton\([\s\S]*?\n\}\n\nconst PublicPageSettingsPanel/, "const PublicPageSettingsPanel");

// 4. State
s = s.replace(
  `    const [activeTab, setActiveTab] = useState<TabId>("identity");
    const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

`,
  `    const [editorConfig, setEditorConfig] = useState<PublicPageEditorConfig>(() => {
      const base = parseEditorConfig(initial.editorConfigRaw);
      return parseEditorConfig({
        ...base,
        hero: {
          ...base.hero,
          title: initial.heroTitle,
          subtitle: initial.heroSubtitle,
          primaryCta: initial.ctaLabel,
          height: legacyHeroHeight(initial.heroHeight),
          overlayEnabled: initial.heroOverlayEnabled,
          overlayOpacity: initial.heroOverlayOpacity,
        },
        appearance: {
          ...base.appearance,
          primaryColor: initial.primaryColor || DEFAULT_PRIMARY,
          secondaryColor: initial.secondaryColor || DEFAULT_SECONDARY,
          accentColor: initial.accentColor,
          stylePreset: initial.stylePreset,
          ambiance: initial.ambiance,
          headingFont: initial.headingFont,
          bodyFont: initial.bodyFont,
          backgroundColor: initial.pageBackgroundColor,
        },
        blockContent: {
          ...base.blockContent,
          about: { ...base.blockContent.about, body: initial.shortDescription },
          highlights: { items: initial.highlights },
          menu: { mode: initial.menuMode, url: initial.menuUrl },
        },
        reservation: {
          ...base.reservation,
          enabled: initial.reservationEnabled,
          intro: initial.preBookingMessage,
          showPhoneCta: initial.showPhoneCta,
          showHoursBeforeForm: initial.showHoursBeforeForm,
          noSlotsMessage: initial.noSlotsMessage,
          minLeadMinutes: initial.minBookingLeadMinutes,
        },
      });
    });
    const [isPublishing, setIsPublishing] = useState(false);

`,
);

// 5. previewDraft
const ps = s.indexOf("    const previewDraft = useMemo((): PublicPagePreviewDraft =>");
const pe = s.indexOf("    const getRestaurantUpdate = useCallback(() => {", ps);
if (ps > 0 && pe > ps) {
  s =
    s.slice(0, ps) +
    `    const editorCtx: EditorContext = useMemo(
      () => ({
        restaurantId: initial.restaurantId,
        slug: effectiveSlug,
        name,
        city,
        cuisineType,
        address,
        phone,
        email,
        websiteUrl,
        googleMapsUrl,
        instagramUrl,
        facebookUrl,
        tiktokUrl,
        logoUrl,
        coverImageUrl:
          coverImageUrl.trim() || (galleryUrls[featuredGalleryIndex] ?? galleryUrls[0] ?? ""),
        galleryUrls: galleryUrls.filter(Boolean),
        openingHours: initial.openingHours,
        menuDocuments: initial.menuDocuments,
        maxPartySize: initial.maxPartySize,
        seoTitle,
        seoDescription,
        pageStatus,
        showPublicInstagram: initial.showPublicInstagram,
        showPublicFacebook: initial.showPublicFacebook,
        showPublicGoogleMaps: initial.showPublicGoogleMaps,
        showPublicAddress: initial.showPublicAddress,
        showPublicPhone: initial.showPublicPhone,
        showPublicEmail: initial.showPublicEmail,
        showPublicWebsite: initial.showPublicWebsite,
        showPublicOpeningHours: initial.showPublicOpeningHours,
      }),
      [
        initial,
        effectiveSlug,
        name,
        city,
        cuisineType,
        address,
        phone,
        email,
        websiteUrl,
        googleMapsUrl,
        instagramUrl,
        facebookUrl,
        tiktokUrl,
        logoUrl,
        coverImageUrl,
        galleryUrls,
        featuredGalleryIndex,
        seoTitle,
        seoDescription,
        pageStatus,
      ],
    );

    const buildMergedConfig = useCallback((): PublicPageEditorConfig => {
      const c = editorConfig;
      return parseEditorConfig({
        ...c,
        hero: { ...c.hero, title: heroTitle, subtitle: heroSubtitle, primaryCta: ctaLabel },
        appearance: {
          ...c.appearance,
          primaryColor,
          secondaryColor,
          accentColor,
          stylePreset,
          ambiance,
          headingFont,
          bodyFont,
        },
        blockContent: {
          ...c.blockContent,
          about: { ...c.blockContent.about, body: shortDescription },
          highlights: { items: highlights },
          menu: { mode: menuMode, url: menuUrl },
        },
        reservation: {
          ...c.reservation,
          enabled: reservationEnabled,
          intro: preBookingMessage,
          showPhoneCta,
          showHoursBeforeForm,
          noSlotsMessage,
          minLeadMinutes: minBookingLeadMinutes,
        },
      });
    }, [
      editorConfig,
      heroTitle,
      heroSubtitle,
      ctaLabel,
      primaryColor,
      secondaryColor,
      accentColor,
      stylePreset,
      ambiance,
      headingFont,
      bodyFont,
      shortDescription,
      highlights,
      menuMode,
      menuUrl,
      reservationEnabled,
      preBookingMessage,
      showPhoneCta,
      showHoursBeforeForm,
      noSlotsMessage,
      minBookingLeadMinutes,
    ]);

    const previewDraft = useMemo((): ExtendedPreviewDraft => {
      const merged = buildMergedConfig();
      const draft = editorConfigToPreviewDraft(merged, editorCtx);
      return {
        ...draft,
        specialMessage: specialMessage.trim() || null,
        editorConfig: merged,
        heroBadgeText: merged.hero.badgeText,
        heroLayout: merged.hero.layout,
        heroAlign: merged.hero.align,
        secondaryCtaLabel: merged.hero.secondaryCtaEnabled ? merged.hero.secondaryCta : undefined,
        themeMode: merged.appearance.themeMode,
        borderRadius: initial.borderRadius,
        buttonStyle: initial.buttonStyle,
        cardStyle: initial.cardStyle,
        fontSizeScale: initial.fontSizeScale,
        terraceEnabled: initial.terraceEnabled,
      };
    }, [
      buildMergedConfig,
      editorCtx,
      specialMessage,
      initial.borderRadius,
      initial.buttonStyle,
      initial.cardStyle,
      initial.fontSizeScale,
      initial.terraceEnabled,
    ]);

` +
    s.slice(pe);
}

// 6. getSettingsUpdate
if (!s.includes("public_page_editor_config")) {
  s = s.replace(
    "    const getSettingsUpdate = useCallback(\n      () => ({",
    "    const getSettingsUpdate = useCallback(\n      () => {\n        const mergedEditor = buildMergedConfig();\n        return ({",
  );
  s = s.replace(
    "        button_color: normalizeHexColor(buttonColor || primaryColor),\n      }),",
    "        button_color: normalizeHexColor(buttonColor || primaryColor),\n        public_page_editor_config: mergedEditor,\n      };\n      },",
  );
  s = s.replace(
    "      [\n        logoUrl,",
    "      [\n        buildMergedConfig,\n        logoUrl,",
  );
}

// 7. Remove mobile preview + tabs
s = s.replace(
  /          <Button[\s\S]*?Voir l'aperçu[\s\S]*?<\/Button>\n        <\/div>\n\n        <div className="-mx-1 flex gap-1 overflow-x-auto pb-1">[\s\S]*?<\/motion>\n\n/,
  "        </div>\n\n        <div className=\"space-y-3\">\n",
);
if (s.includes("TABS.map")) {
  s = s.replace(
    /          <Button[\s\S]*?Voir l'aperçu[\s\S]*?<\/Button>\n        <\/motion>\n\n        <div className="-mx-1 flex gap-1 overflow-x-auto pb-1">[\s\S]*?<\/div>\n\n/,
    "        </div>\n\n        <div className=\"space-y-3\">\n",
  );
}

const tabTitles = {
  identity: "Identité & contact",
  appearance: "Apparence",
  photos: "Photos",
  content: "Contenu",
  reservation: "Réservation",
  seo: "SEO & lien public",
  publish: "Publication",
};
for (const [id, title] of Object.entries(tabTitles)) {
  s = s.replaceAll(`{activeTab === "${id}" ? (`, `<SettingsAccordion title="${title}">`);
}
s = s.replaceAll("\n        ) : null}", "\n        </SettingsAccordion>");

// Hero accordion
const heroAccordion = `
        <SettingsAccordion title="Hero & accroche">
          <div className="space-y-5">
            <div>
              <label className="dashboard-field-label">Badge (au-dessus du titre)</label>
              <Input
                className="mt-2"
                value={editorConfig.hero.badgeText}
                onChange={(e) => {
                  setEditorConfig((c) => parseEditorConfig({ ...c, hero: { ...c.hero, badgeText: e.target.value } }));
                  markDirty();
                }}
              />
            </div>
            <div>
              <label className="dashboard-field-label">Titre principal</label>
              <FieldHint>Ex. automatique : « {defaultHeroTitle(displayName)} »</FieldHint>
              <Input
                className="mt-2"
                value={heroTitle}
                onChange={(e) => { setHeroTitle(e.target.value); markDirty(); }}
                placeholder={defaultHeroTitle(displayName)}
              />
            </div>
            <div>
              <label className="dashboard-field-label">Sous-titre court</label>
              <Input
                className="mt-2"
                value={heroSubtitle}
                onChange={(e) => { setHeroSubtitle(e.target.value); markDirty(); }}
                placeholder={defaultHeroSubtitle(cuisineType, city, ambiance)}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="dashboard-field-label">Mise en page</label>
                <select
                  className="mt-2 h-11 w-full rounded-xl border border-zg-border bg-zg-surface px-3 text-sm"
                  value={editorConfig.hero.layout}
                  onChange={(e) => {
                    setEditorConfig((c) =>
                      parseEditorConfig({ ...c, hero: { ...c.hero, layout: e.target.value as PublicPageEditorConfig["hero"]["layout"] } }),
                    );
                    markDirty();
                  }}
                >
                  <option value="center">Centré</option>
                  <option value="left">Aligné à gauche</option>
                  <option value="overlay">Overlay bas</option>
                </select>
              </div>
              <div>
                <label className="dashboard-field-label">Hauteur</label>
                <select
                  className="mt-2 h-11 w-full rounded-xl border border-zg-border bg-zg-surface px-3 text-sm"
                  value={editorConfig.hero.height}
                  onChange={(e) => {
                    setEditorConfig((c) =>
                      parseEditorConfig({ ...c, hero: { ...c.hero, height: e.target.value as PublicPageEditorConfig["hero"]["height"] } }),
                    );
                    markDirty();
                  }}
                >
                  <option value="compact">Compact</option>
                  <option value="normal">Normal</option>
                  <option value="immersive">Immersif</option>
                </select>
              </div>
              <div>
                <label className="dashboard-field-label">Alignement texte</label>
                <select
                  className="mt-2 h-11 w-full rounded-xl border border-zg-border bg-zg-surface px-3 text-sm"
                  value={editorConfig.hero.align}
                  onChange={(e) => {
                    setEditorConfig((c) =>
                      parseEditorConfig({ ...c, hero: { ...c.hero, align: e.target.value as PublicPageEditorConfig["hero"]["align"] } }),
                    );
                    markDirty();
                  }}
                >
                  <option value="left">Gauche</option>
                  <option value="center">Centre</option>
                  <option value="right">Droite</option>
                </select>
              </div>
            </div>
            <div>
              <label className="dashboard-field-label">Texte du bouton principal</label>
              <Input value={ctaLabel} onChange={(e) => { setCtaLabel(e.target.value); markDirty(); }} placeholder="Réserver une table" />
            </div>
            <Toggle
              checked={editorConfig.hero.secondaryCtaEnabled}
              onChange={(v) => {
                setEditorConfig((c) => parseEditorConfig({ ...c, hero: { ...c.hero, secondaryCtaEnabled: v } }));
                markDirty();
              }}
              label="Afficher un second bouton (menu)"
            />
            {editorConfig.hero.secondaryCtaEnabled ? (
              <Input
                value={editorConfig.hero.secondaryCta}
                onChange={(e) => {
                  setEditorConfig((c) => parseEditorConfig({ ...c, hero: { ...c.hero, secondaryCta: e.target.value } }));
                  markDirty();
                }}
                placeholder="Voir le menu"
              />
            ) : null}
          </div>
        </SettingsAccordion>
`;
if (!s.includes('title="Hero & accroche"')) {
  s = s.replace('<SettingsAccordion title="Apparence">', heroAccordion.replace(/<motion/g, "<div").replace(/<\/motion>/g, "</motion>").replace("</motion>", "</div>") + '\n        <SettingsAccordion title="Apparence">');
}

// Blocks accordion
const blocksAccordion = `
        <SettingsAccordion title="Sections & blocs">
          <div className="space-y-4">
            <FieldHint>Activez les blocs visibles sur votre page publique.</FieldHint>
            <div className="grid gap-2 sm:grid-cols-2">
              {PAGE_BLOCK_IDS.map((id) => (
                <Toggle
                  key={id}
                  checked={editorConfig.blocks[id]?.enabled !== false}
                  onChange={(v) => {
                    setEditorConfig((c) =>
                      parseEditorConfig({
                        ...c,
                        blocks: { ...c.blocks, [id]: { enabled: v } },
                      }),
                    );
                    markDirty();
                  }}
                  label={BLOCK_LABELS[id] ?? id}
                />
              ))}
            </div>
          </div>
        </SettingsAccordion>
`;
if (!s.includes('title="Sections & blocs"')) {
  s = s.replace('<SettingsAccordion title="Contenu">', blocksAccordion + '\n        <SettingsAccordion title="Contenu">');
}

// Remove duplicate hero fields from content
s = s.replace(
  /            <div>\n              <label className="dashboard-field-label">Titre principal<\/label>[\s\S]*?placeholder=\{defaultHeroSubtitle\(cuisineType, city, ambiance\)\}\n              \/>\n            <\/div>\n/,
  "",
);

// 8. Return - anchor on export default
const returnAnchor = "export default PublicPageSettingsPanel";
const exportIdx = s.lastIndexOf(returnAnchor);
if (exportIdx < 0) throw new Error("export anchor missing");
const tail = s.slice(exportIdx);
const body = s.slice(0, exportIdx);
const lastReturn = body.lastIndexOf("    return (");
if (lastReturn < 0) throw new Error("return missing");
const newReturn = `    return (
      <div className="space-y-2">
        {editor}
        <PublicPagePreviewStudio
          draft={previewDraft}
          publicPath={publicPath}
          onPublish={async () => {
            setIsPublishing(true);
            const result = await publishPage();
            setIsPublishing(false);
            if (!result.ok) onMessage?.(result.error ?? "Échec de la publication.");
          }}
          isPublishing={isPublishing}
        />
      </div>
    );
`;
s = body.slice(0, lastReturn) + newReturn + tail;

// Close space-y-3
if (!s.includes('</SettingsAccordion>\n        </motion>\n      </motion>')) {
  s = s.replace(
    /(\s+<\/SettingsAccordion>\n)(      <\/div>\n    \);\n\n    return \()/,
    "$1        </motion>\n$2",
  );
  s = s.replace("        </motion>\n\n    return (", "        </div>\n      </motion>\n    );\n\n    return (");
}

// Fix accidental motion in hero if any
s = s.replace(/<motion className="space-y-5">/g, '<div className="space-y-5">');
s = s.replace(/<motion>\n              <label className="dashboard-field-label">Titre principal/g, '<motion>\n              <label className="dashboard-field-label">Titre principal');
s = s.replace(/<motion>\n              <label className="dashboard-field-label">Titre principal/g, '<div>\n              <label className="dashboard-field-label">Titre principal');

const linesAfter = s.split("\n").length;
if (linesAfter > linesBefore + 200) {
  throw new Error(`line count exploded: ${linesBefore} -> ${linesAfter}`);
}

fs.writeFileSync(p, s);
console.log(`OK ${linesBefore} -> ${linesAfter} lines`);
console.log("TABS:", s.includes("TABS.map"), "LivePreview:", s.includes("PublicPageLivePreview"));
