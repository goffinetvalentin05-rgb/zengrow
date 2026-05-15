import fs from "fs";

const p = "c:/Users/Goffi/zengrow/src/components/dashboard/settings/public-page-settings-panel.tsx";
let s = fs.readFileSync(p, "utf8");

// Remove TabButton
s = s.replace(
  /function TabButton\([\s\S]*?\n\}\n\nconst PublicPageSettingsPanel/,
  "const PublicPageSettingsPanel",
);

// State: remove tabs, add editorConfig
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

// Add legacyHeroHeight to imports
if (!s.includes("legacyHeroHeight")) {
  s = s.replace(
    "  DEFAULT_SECTION_ORDER,\n} from",
    "  DEFAULT_SECTION_ORDER,\n  legacyHeroHeight,\n} from",
  );
}

// Replace previewDraft block
const previewStart = s.indexOf("    const previewDraft = useMemo((): PublicPagePreviewDraft =>");
const previewEnd = s.indexOf("    const getRestaurantUpdate = useCallback(() => {", previewStart);
if (previewStart > 0 && previewEnd > previewStart) {
  const replacement = `    const editorCtx: EditorContext = useMemo(
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
        hero: {
          ...c.hero,
          title: heroTitle,
          subtitle: heroSubtitle,
          primaryCta: ctaLabel,
        },
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
    }, [buildMergedConfig, editorCtx, specialMessage, initial.borderRadius, initial.buttonStyle, initial.cardStyle, initial.fontSizeScale, initial.terraceEnabled]);

`;
  s = s.slice(0, previewStart) + replacement + s.slice(previewEnd);
}

// getSettingsUpdate
if (!s.includes("public_page_editor_config")) {
  s = s.replace(
    "        button_color: normalizeHexColor(buttonColor || primaryColor),\n      }),",
    "        button_color: normalizeHexColor(buttonColor || primaryColor),\n        public_page_editor_config: buildMergedConfig(),\n      }),",
  );
  s = s.replace(
    "    const getSettingsUpdate = useCallback(\n      () => ({",
    "    const getSettingsUpdate = useCallback(\n      () => {\n        const mergedEditor = buildMergedConfig();\n        return ({",
  );
  s = s.replace(
    "        public_page_editor_config: buildMergedConfig(),\n      }),",
    "        public_page_editor_config: mergedEditor,\n      };\n      },",
  );
  s = s.replace(
    "      [\n        logoUrl,",
    "      [\n        buildMergedConfig,\n        logoUrl,",
  );
}

// Remove mobile preview button + tabs
s = s.replace(
  /          <Button[\s\S]*?Voir l'aperçu[\s\S]*?<\/Button>\n        <\/motion>\n\n        <div className="-mx-1 flex gap-1 overflow-x-auto pb-1">[\s\S]*?<\/div>\n\n/,
  "        </div>\n\n        <div className=\"space-y-3\">\n",
);

// If above didn't match, try without motion
if (s.includes("TABS.map")) {
  s = s.replace(
    /          <Button[\s\S]*?Voir l'aperçu[\s\S]*?<\/Button>\n        <\/div>\n\n        <div className="-mx-1 flex gap-1 overflow-x-auto pb-1">[\s\S]*?<\/div>\n\n/,
    "        </motion>\n\n        <div className=\"space-y-3\">\n",
  );
}

// Accordion wrappers
const tabMap = [
  ["identity", "Identité & contact"],
  ["appearance", "Apparence"],
  ["photos", "Photos"],
  ["content", "Contenu"],
  ["reservation", "Réservation"],
  ["seo", "SEO & lien public"],
  ["publish", "Publication"],
];

for (const [id, title] of tabMap) {
  s = s.replace(
    `{activeTab === "${id}" ? (`,
    `<SettingsAccordion title="${title}">`,
  );
  // Only replace first ) : null} after each section - use regex per section is hard
}

// Replace all `) : null}` that close tab sections - risky but tabs only use this pattern in editor
// Count: 7 sections - replace `        ) : null}\n\n        {activeTab` patterns already gone
// Replace remaining `        ) : null}` before next SettingsAccordion or closing div
s = s.replace(/\n        \) : null\}/g, "\n        </SettingsAccordion>");

// Insert Hero accordion before appearance - find appearance accordion
if (!s.includes('title="Hero & accroche"')) {
  const heroBlock = `
        <SettingsAccordion title="Hero & accroche">
          <motion className="space-y-5">
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
              <motion>
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
  s = s.replace(
    '<SettingsAccordion title="Apparence">',
    heroBlock + '        <SettingsAccordion title="Apparence">',
  );
}

// Blocks accordion before content
if (!s.includes('title="Sections & blocs"')) {
  const blocksBlock = `
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
  s = s.replace(
    '<SettingsAccordion title="Contenu">',
    blocksBlock + '        <SettingsAccordion title="Contenu">',
  );
}

// Remove duplicate hero fields from content section
s = s.replace(
  /            <div>\n              <label className="dashboard-field-label">Titre principal<\/label>[\s\S]*?placeholder=\{defaultHeroSubtitle\(cuisineType, city, ambiance\)\}\n              \/>\n            <\/div>\n/,
  "",
);

// Return layout
s = s.replace(
  `    return (
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:items-start">
        <div>{editor}</div>
        <motion
          className={cn(
            "lg:sticky lg:top-24",
            mobilePreviewOpen ? "block" : "hidden lg:block",
          )}
        >
          <PublicPageLivePreview draft={previewDraft} publicPath={publicPath} />
        </motion>
      </motion>
    );`,
  `    return (
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
      </motion>
    );`,
);

// Fix accidental motion tags in hero block
s = s.replace(/<motion className="space-y-5">/g, '<div className="space-y-5">');
s = s.replace(/<motion>\s*<label className="dashboard-field-label">Hauteur<\/label>/g, '<div>\n                <label className="dashboard-field-label">Hauteur</label>');
s = s.replace(/          <\/div>\n        <\/SettingsAccordion>\n\n        <SettingsAccordion title="Apparence">/,
  '          </div>\n        </SettingsAccordion>\n\n        <SettingsAccordion title="Apparence">');

// Close space-y-3 div before editor closes
if (!s.includes('</motion>\n      </motion>\n    );') && s.includes('<div className="space-y-3">')) {
  s = s.replace(
    /(\s+<\/SettingsAccordion>\n)(\s+<\/div>\n    \);)/,
    "$1        </div>\n$2",
  );
}

fs.writeFileSync(p, s);
console.log("Panel refactored. TABS remaining:", s.includes("TABS.map"), "activeTab:", s.includes("activeTab"));
