"use client";

/**
 * Decorative backdrop for the hero: a field of out-of-focus profile previews.
 * Every name, niche and preview here is a design placeholder.
 * Motion is disabled until a dedicated animation pass.
 */

type Kind = "thumb" | "card";

type Slot = {
  x: number;
  y: number;
  w: number;
  blur: number;
  peak: number;
  kind: Kind;
  tint: string;
  drop?: boolean;
};

const TINTS = {
  amber: "34 42% 52%",
  teal: "186 34% 48%",
  rose: "342 38% 54%",
  violet: "262 34% 58%",
  blue: "214 40% 54%",
  lime: "96 26% 48%",
} as const;

const SLOTS: Slot[] = [
  { x: 3, y: 7, w: 12, blur: 5, peak: 0.34, kind: "thumb", tint: TINTS.amber },
  { x: 19, y: 2, w: 9, blur: 6, peak: 0.24, kind: "card", tint: TINTS.teal, drop: true },
  { x: 34, y: 9, w: 10, blur: 8, peak: 0.16, kind: "thumb", tint: TINTS.rose, drop: true },
  { x: 57, y: 3, w: 11, blur: 7, peak: 0.2, kind: "card", tint: TINTS.violet, drop: true },
  { x: 72, y: 6, w: 13, blur: 5, peak: 0.32, kind: "thumb", tint: TINTS.blue },
  { x: 89, y: 2, w: 10, blur: 6, peak: 0.26, kind: "card", tint: TINTS.lime, drop: true },

  { x: -2, y: 31, w: 11, blur: 4, peak: 0.38, kind: "card", tint: TINTS.blue },
  { x: 7, y: 53, w: 13, blur: 3, peak: 0.42, kind: "thumb", tint: TINTS.rose },
  { x: 84, y: 34, w: 12, blur: 4, peak: 0.36, kind: "thumb", tint: TINTS.amber },
  { x: 92, y: 57, w: 10, blur: 5, peak: 0.3, kind: "card", tint: TINTS.teal },
  { x: -4, y: 75, w: 10, blur: 6, peak: 0.24, kind: "thumb", tint: TINTS.violet, drop: true },
  { x: 87, y: 79, w: 12, blur: 5, peak: 0.28, kind: "thumb", tint: TINTS.lime, drop: true },

  { x: 13, y: 86, w: 11, blur: 5, peak: 0.3, kind: "card", tint: TINTS.amber },
  { x: 30, y: 92, w: 12, blur: 7, peak: 0.2, kind: "thumb", tint: TINTS.blue, drop: true },
  { x: 48, y: 89, w: 10, blur: 8, peak: 0.16, kind: "card", tint: TINTS.rose, drop: true },
  { x: 64, y: 93, w: 12, blur: 6, peak: 0.24, kind: "thumb", tint: TINTS.teal, drop: true },
  { x: 77, y: 86, w: 9, blur: 5, peak: 0.28, kind: "card", tint: TINTS.violet },
  { x: 40, y: 76, w: 9, blur: 8, peak: 0.14, kind: "thumb", tint: TINTS.amber, drop: true },
];

const POOL = [
  { name: "Lucas Martin", niche: "SaaS", tag: "Rising" },
  { name: "Alex Morgan", niche: "E-commerce", tag: "New" },
  { name: "Maya Chen", niche: "Creators", tag: "Rising" },
  { name: "Jonas Keller", niche: "Agency" },
  { name: "Sofia Keller", niche: "SaaS", tag: "New" },
  { name: "Ryan Park", niche: "AI", tag: "Niche match" },
  { name: "Nina Reyes", niche: "OFM" },
  { name: "Tom Vasseur", niche: "Marketing", tag: "Rising" },
  { name: "Lea Hoffmann", niche: "Freelancing" },
  { name: "Marc Dubois", niche: "Real Estate" },
  { name: "Iris Novak", niche: "Sales", tag: "New" },
  { name: "Elias Braun", niche: "AI" },
  { name: "Clara Silva", niche: "Creators", tag: "Worth discovering" },
  { name: "Hugo Perret", niche: "E-commerce" },
];

export function HeroField() {
  return (
    <div className="go-hero__field" aria-hidden>
      {SLOTS.map((slot, index) => (
        <Tile key={`${slot.x}-${slot.y}`} slot={slot} seed={index} />
      ))}
      <span className="go-hero__scrim" />
    </div>
  );
}

function Tile({ slot, seed }: { slot: Slot; seed: number }) {
  const person = POOL[(seed * 5) % POOL.length];

  return (
    <div
      className={`go-tile go-tile--${slot.kind}${slot.drop ? " go-tile--drop" : ""}`}
      style={
        {
          "--x": `${slot.x}%`,
          "--y": `${slot.y}%`,
          "--w": slot.w,
          "--blur": slot.blur,
          "--peak": slot.peak,
          "--tint": slot.tint,
        } as React.CSSProperties
      }
    >
      {slot.kind === "thumb" ? (
        <>
          <span className="go-tile__media">
            <span className="go-tile__figure" />
            <span className="go-tile__bar" />
          </span>
          {person.tag ? <span className="go-tile__tag">{person.tag}</span> : null}
          <span className="go-tile__name">{person.name}</span>
          <span className="go-tile__niche">{person.niche}</span>
        </>
      ) : (
        <>
          <span className="go-tile__row">
            <span className="go-tile__avatar">{person.name.slice(0, 1)}</span>
            <span className="go-tile__id">
              <span className="go-tile__name">{person.name}</span>
              <span className="go-tile__niche">{person.niche}</span>
            </span>
          </span>
          {person.tag ? <span className="go-tile__tag">{person.tag}</span> : null}
          <span className="go-tile__lines">
            <i />
            <i />
          </span>
        </>
      )}
    </div>
  );
}
