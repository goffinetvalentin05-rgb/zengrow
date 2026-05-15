import fs from "fs";
const p = "c:/Users/Goffi/zengrow/src/components/reservation/public-reservation-form.tsx";
let s = fs.readFileSync(p, "utf8");

// Fix erroneous motion/div closings at end
s = s.replace(/\s*<\/motion>\s*\n\s*<\/PublicPageSection>/g, "\n        </PublicPageSection>");
s = s.replace(/\s*<\/motion>\s*\n\s*\);\s*\n\}/g, "\n    </motion>\n  );\n}");
s = s.replace(/<\/motion>/g, "</div>");
s = s.replace(/<motion className=/g, "<motion className=");
s = s.replace(/<motion className=/g, "<div className=");
s = s.replace(/<motion>/g, "<div>");

const galleryOld = `        {blockEnabled("gallery") && galleryImageUrls.length > 0 ? (
          <div>
            <h2
              className="mb-6 text-center text-2xl font-medium md:text-left md:text-3xl"
              style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}
            >
              Galerie
            </h2>
            <motion className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">`;

const galleryNew = `        {blockEnabled("gallery") && galleryImageUrls.length > 0 ? (
          <PublicPageSection surface={pageTheme.section("gallery")}>
            <h2
              className="mb-6 text-center text-2xl font-medium md:text-left md:text-3xl"
              style={{ fontFamily: "var(--heading-font)", color: pageTheme.section("gallery").headingColor }}
            >
              Galerie
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">`;

if (s.includes(galleryOld.split("\n")[1])) {
  s = s.replace(
    /        \{blockEnabled\("gallery"\)[\s\S]*?        \) : null\}\n\n        \{blockEnabled\("about"\)/,
    `        {blockEnabled("gallery") && galleryImageUrls.length > 0 ? (
          <PublicPageSection surface={pageTheme.section("gallery")}>
            <h2
              className="mb-6 text-center text-2xl font-medium md:text-left md:text-3xl"
              style={{ fontFamily: "var(--heading-font)", color: pageTheme.section("gallery").headingColor }}
            >
              Galerie
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
              {galleryImageUrls.map((src) => (
                <div
                  key={src}
                  className="group relative aspect-[4/3] overflow-hidden rounded-[var(--radius)]"
                  style={{ backgroundColor: "color-mix(in srgb, var(--body-text) 8%, transparent)" }}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-cover transition duration-700 ease-out group-hover:scale-[1.06]"
                    sizes="(max-width: 768px) 50vw, 33vw"
                    unoptimized
                  />
                </div>
              ))}
            </motion>
          </PublicPageSection>
        ) : null}

        {blockEnabled("about")`,
  );
}

s = s.replace(
  /        \{blockEnabled\("about"\) && descriptionText \? \(\n          <PublicDescription text=\{descriptionText\} bodyColor=\{bodyTextColor\} accentColor=\{accentColor\} \/>\n        \) : null\}\n\n        \{reservationEnabled \? \([\s\S]*?\) : null\}\n      <\/motion>/,
  `        {blockEnabled("about") && descriptionText ? (
          <PublicPageSection surface={pageTheme.section("about")}>
            <PublicDescription
              text={descriptionText}
              bodyColor={pageTheme.section("about").color}
              accentColor={accentColor}
            />
          </PublicPageSection>
        ) : null}

        {blockEnabled("final_cta") && reservationEnabled ? (
          <PublicPageSection surface={pageTheme.section("final_cta")}>
            <div className="mx-auto max-w-2xl text-center">
              <h2
                className="text-2xl font-semibold md:text-3xl"
                style={{ fontFamily: "var(--heading-font)", color: pageTheme.section("final_cta").headingColor }}
              >
                {effectiveConfig.blockContent.finalCta.title}
              </h2>
              <p className="mt-3 text-base opacity-90">{effectiveConfig.blockContent.finalCta.subtitle}</p>
              <button
                type="button"
                onClick={scrollToReservation}
                className={cn(ctaStyle.className, "mt-6 min-h-[52px] px-8")}
                style={ctaStyle.style}
              >
                {effectiveConfig.blockContent.finalCta.button || ctaLabel}
              </button>
            </motion>
          </PublicPageSection>
        ) : null}
      </motion>`,
);

// final cleanup motion->motion
s = s.replace(/<\/motion>/g, "</div>");
s = s.replace(/<motion className=/g, "<div className=");
s = s.replace(/<motion>/g, "<div>");

// fix double closing in gallery replacement
s = s.replace("            </motion>\n          </PublicPageSection>", "            </motion>\n          </PublicPageSection>");
s = s.replace("            </motion>\n          </PublicPageSection>", "            </motion>\n          </PublicPageSection>");

fs.writeFileSync(p, s);
console.log("fixed form tail");
