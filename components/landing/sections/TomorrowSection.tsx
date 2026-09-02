"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLocale } from "../locale-provider";
import { Container, Eyebrow, Section, SectionLead, SectionTitle } from "../ui";

function useTomorrowReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

function MatchLinkIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden>
      <path
        d="M10.5 13.2c1.9-3.2 6.1-4.7 10.1-3.4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M18.2 7.6l3.1 2.4-3.6 1.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21.5 18.8c-1.9 3.2-6.1 4.7-10.1 3.4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M13.8 24.4l-3.1-2.4 3.6-1.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MatchScene() {
  return (
    <div className="go-tomorrow-scene" aria-hidden>
      <div className="go-tomorrow-scene__glow" />
      <div className="go-tomorrow-scene__stage">
        <article className="go-tomorrow-card go-tomorrow-card--profile">
          <Image
            src="/landing/tomorrow-profile.jpg"
            alt=""
            fill
            sizes="(max-width: 960px) 42vw, 12rem"
            className="go-tomorrow-card__photo"
          />
          <span className="go-tomorrow-card__veil" />
        </article>

        <article className="go-tomorrow-card go-tomorrow-card--brand">
          <span className="go-tomorrow-card__glyph">
            <i />
            <i />
            <i />
          </span>
          <p>Brand</p>
        </article>

        <div className="go-tomorrow-link">
          <MatchLinkIcon />
        </div>
      </div>
    </div>
  );
}

export function TomorrowSection() {
  const { t } = useLocale();
  const { ref, visible } = useTomorrowReveal();

  return (
    <Section className="go-tomorrow-section">
      <Container>
        <div
          ref={ref}
          className={visible ? "go-explore go-tomorrow is-in" : "go-explore go-tomorrow"}
        >
          <div className="go-explore__copy go-tomorrow__copy">
            <Eyebrow>{t.tomorrow.label}</Eyebrow>
            <SectionTitle>{t.tomorrow.title}</SectionTitle>
            <SectionLead>{t.tomorrow.text}</SectionLead>
          </div>

          <div className="go-explore__visual go-tomorrow__visual">
            <MatchScene />
          </div>
        </div>
      </Container>
    </Section>
  );
}
