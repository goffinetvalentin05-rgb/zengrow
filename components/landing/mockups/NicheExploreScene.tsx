"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { CategoryThumb } from "./CategoryThumb";
import type { CategoryKind } from "../locales/types";

type NicheCard = {
  label: string;
  kind?: CategoryKind;
};

const NICHE_CARDS: NicheCard[] = [
  { label: "OFM", kind: "ofm" },
  { label: "AI", kind: "ai" },
  { label: "SaaS", kind: "saas" },
  { label: "Sport" },
  { label: "Real Estate", kind: "realestate" },
  { label: "Marketing", kind: "marketing" },
  { label: "E-commerce", kind: "ecommerce" },
  { label: "Agency", kind: "agency" },
  { label: "Freelancing", kind: "freelancing" },
  { label: "Creators", kind: "creators" },
];

const ROW_A = [0, 3, 6, 9, 2, 5, 8, 1, 4, 7];
const ROW_B = [1, 4, 7, 0, 3, 6, 9, 2, 5, 8];
const ROW_C = [2, 5, 8, 1, 4, 7, 0, 3, 6, 9];

function SportThumb() {
  return (
    <div className="go-thumb go-thumb--sport" aria-hidden>
      <span className="go-thumb__wash" />
      <div className="go-thumb__sport">
        <span className="go-thumb__sport-ring" />
        <span className="go-thumb__sport-ball" />
      </div>
    </div>
  );
}

function NicheExploreCard({ label, kind }: NicheCard) {
  return (
    <div className="go-niche-card">
      <div className="go-niche-card__visual">
        {kind ? <CategoryThumb kind={kind} /> : <SportThumb />}
      </div>
      <span className="go-niche-card__label">{label}</span>
    </div>
  );
}

function NicheMarquee({
  indices,
  reverse,
  duration,
  className,
}: {
  indices: number[];
  reverse?: boolean;
  duration: string;
  className?: string;
}) {
  const cards = indices.map((index) => NICHE_CARDS[index % NICHE_CARDS.length]);
  const loop = [...cards, ...cards];

  return (
    <div className={`go-niche-marquee ${className ?? ""}`.trim()}>
      <div
        className={`go-niche-marquee__track${reverse ? " go-niche-marquee__track--reverse" : ""}`}
        style={{ "--dur": duration } as CSSProperties}
      >
        {loop.map((card, index) => (
          <NicheExploreCard key={`${card.label}-${index}`} {...card} />
        ))}
      </div>
    </div>
  );
}

function SharpzPhoneScreen() {
  return (
    <div className="go-niche-phone__ui" aria-hidden>
      <div className="go-niche-phone__ui-head">
        <span>Sharpz</span>
        <i />
      </div>
      <p className="go-niche-phone__ui-kicker">Niche</p>
      <p className="go-niche-phone__ui-niche">SaaS</p>
      <div className="go-niche-phone__ui-chips">
        <span className="is-on">Rising</span>
        <span>New</span>
        <span>&lt; 5k</span>
      </div>
      <div className="go-niche-phone__ui-list">
        <div>
          <strong>Lucas M.</strong>
          <span>Flowly · 2.1k</span>
        </div>
        <div>
          <strong>Sofia K.</strong>
          <span>Orbit · 840</span>
        </div>
        <div>
          <strong>Ryan P.</strong>
          <span>Ledger · 3.4k</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Explore scene: scrolling niche universes + person on phone in foreground.
 */
export function NicheExploreScene() {
  return (
    <div className="go-niche-scene" aria-hidden>
      <div className="go-niche-scene__streams">
        <NicheMarquee indices={ROW_A} duration="48s" className="go-niche-marquee--a" />
        <NicheMarquee indices={ROW_B} reverse duration="40s" className="go-niche-marquee--b" />
        <NicheMarquee indices={ROW_C} duration="52s" className="go-niche-marquee--c" />
      </div>

      <div className="go-niche-scene__fade" />

      <div className="go-niche-scene__figure">
        <Image
          src="/landing/explore-person.jpg"
          alt=""
          width={900}
          height={1100}
          className="go-niche-scene__person"
          sizes="(max-width: 960px) 90vw, 20rem"
        />
      </div>

      <div className="go-niche-scene__phone">
        <div className="go-niche-phone">
          <Image
            src="/landing/hero-hand-phone.png"
            alt=""
            width={1200}
            height={1200}
            className="go-niche-phone__hand"
            sizes="(max-width: 960px) 70vw, 16rem"
          />
          <SharpzPhoneScreen />
        </div>
      </div>
    </div>
  );
}
