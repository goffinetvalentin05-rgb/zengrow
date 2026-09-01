"use client";

const NICHES = [
  "IA",
  "OFM",
  "SaaS",
  "E-commerce",
  "Créateurs",
  "Agence",
  "Sport",
  "No-code",
  "Product",
  "Freelance",
  "Marketing",
  "Real Estate",
] as const;

function NicheBandSet({ id }: { id: string }) {
  return (
    <div className="go-niche-band__set" aria-hidden>
      {NICHES.map((label) => (
        <span key={`${id}-${label}`} className="go-niche-band__group">
          <span className="go-niche-band__item">{label}</span>
          <span className="go-niche-band__sep" aria-hidden>
            ✦
          </span>
        </span>
      ))}
    </div>
  );
}

/** Full-width niche marquee between hero and the next section. */
export function NicheBand() {
  return (
    <div className="go-niche-band" aria-label="Univers Sharpz">
      <div className="go-niche-band__viewport">
        <div className="go-niche-band__track">
          <NicheBandSet id="a" />
          <NicheBandSet id="b" />
        </div>
      </div>
    </div>
  );
}
