import fs from "fs";

const p = "src/components/reservation/public-reservation-form.tsx";
let s = fs.readFileSync(p, "utf8");
const start = s.indexOf('      {blockEnabled("location") && hasFooterContent ? (');
if (start < 0) {
  console.error("start not found");
  process.exit(1);
}
const endMarker = "      ) : null}\n    </motion.div>\n  );";
let end = s.indexOf("      ) : null}\n    </div>\n  );", start);
if (end < 0) end = s.lastIndexOf("      ) : null}", s.length - 20);
const replacement = `      {blockEnabled("location") && hasFooterContent ? (
        <>
          <PremiumPracticalInfo
            address={showAddressRow ? restaurantAddress : null}
            phone={showPhoneRow ? restaurantPhone : null}
            openingHoursLines={showHoursRow ? openingHoursLines : []}
            googleMapsUrl={googleMapsUrl}
            parking={premium.practical.parking}
            accessibility={premium.practical.accessibility}
            showMaps={showMapsRow}
          />
          {(showInstagram || showFacebook) && blockEnabled("social") ? (
            <motion.div className="border-t border-[color-mix(in_srgb,var(--body-text)_8%,transparent)] py-8">
              <div className="mx-auto flex max-w-7xl justify-center gap-4 px-5">
                {showInstagram ? (
                  <a href={instagramUrl!} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="opacity-70 transition hover:opacity-100">
                    <Instagram className="h-6 w-6" />
                  </a>
                ) : null}
                {showFacebook ? (
                  <a href={facebookUrl!} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="opacity-70 transition hover:opacity-100">
                    <Facebook className="h-6 w-6" />
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}
        </>
`;
// fix motion.div in replacement
const fixed = replacement.replace(/motion\.div/g, "div");
// find closing of location block - last ) : null before final </motion.div>
let depth = 0;
let pos = start;
let endLine = start;
while (pos < s.length) {
  const nextClose = s.indexOf("      ) : null}", pos + 1);
  if (nextClose < 0) break;
  endLine = nextClose + "      ) : null}".length;
  if (s.slice(nextClose, nextClose + 30).includes("    </div>")) break;
  pos = nextClose + 1;
}
const s2 = s.slice(0, start) + fixed + s.slice(endLine);
fs.writeFileSync(p, s2);
console.log("ok");
