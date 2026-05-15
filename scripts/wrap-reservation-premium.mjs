import fs from "fs";

const p = "src/components/reservation/public-reservation-form.tsx";
let s = fs.readFileSync(p, "utf8");

const start = s.indexOf('        {blockEnabled("reservation") && reservationEnabled ? (\n        <section id="reservation"');
const headerEnd = s.indexOf("            {showHoursBeforeForm && showHoursRow ? (", start);

const open = `        {blockEnabled("reservation") && reservationEnabled ? (
        <motion.div style={{ order: sectionOrderIndex("reservation") }}>
        <PremiumReservationSection
          title={reservationSectionTitle()}
          intro={effectiveConfig.reservation.intro}
          groupMessage={premium.reservation.groupMessage}
          showPhoneAlt={showPhoneCta && showPhoneRow}
          phone={restaurantPhone}
        >
`;

const fixedOpen = open.replace(/motion\.div/g, "motion.div").replace("<motion.div", "<motion.div").replace("motion.div", "div");

const mid = s.slice(0, start) + fixedOpen.replace("<motion.div", "<div").replace(/motion\.div/g, "motion.div") + s.slice(headerEnd);

// fix - simpler
const open2 = `        {blockEnabled("reservation") && reservationEnabled ? (
        <div style={{ order: sectionOrderIndex("reservation") }}>
        <PremiumReservationSection
          title={reservationSectionTitle()}
          intro={effectiveConfig.reservation.intro}
          groupMessage={premium.reservation.groupMessage}
          showPhoneAlt={showPhoneCta && showPhoneRow}
          phone={restaurantPhone}
        >
`;

let s2 = s.slice(0, start) + open2 + s.slice(headerEnd);

// close: replace end of reservation - find `          </div>\n        </section>\n        ) : showPhoneCta`
const closeOld = `          </motion.div>
        </section>
        ) : showPhoneCta`;
const closeOld2 = `          </div>
        </section>
        ) : showPhoneCta`;

if (s2.includes(closeOld2)) {
  s2 = s2.replace(
    closeOld2,
    `        </PremiumReservationSection>
        </div>
        ) : showPhoneCta`,
  );
} else {
  console.error("close marker not found");
  process.exit(1);
}

// remove duplicate phone CTA inside form
s2 = s2.replace(
  /\s*\{showPhoneCta && showPhoneRow && !previewMode \? \(\s*<p className="mt-4 text-center text-sm">[\s\S]*?<\/p>\s*\) : null\}\s*/,
  "\n",
);

fs.writeFileSync(p, s2);
console.log("ok");
