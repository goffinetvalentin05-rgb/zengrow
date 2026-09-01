"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "../locale-provider";
import { Container, Section } from "../ui";

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function useDifferenceProgress(trackRef: React.RefObject<HTMLDivElement | null>) {
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyMotion = () => {
      const reduced = media.matches;
      setReducedMotion(reduced);
      if (reduced) setProgress(1);
    };
    applyMotion();
    media.addEventListener("change", applyMotion);
    return () => media.removeEventListener("change", applyMotion);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const track = trackRef.current;
    if (!track) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = track.getBoundingClientRect();
      const scrollable = track.offsetHeight - window.innerHeight;
      if (scrollable <= 0) {
        setProgress(rect.top <= 0 ? 1 : 0);
        return;
      }
      const scrolled = clamp(-rect.top / scrollable, 0, 1);
      setProgress(scrolled);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [reducedMotion, trackRef]);

  return { progress, reducedMotion };
}

function wordReveal(progress: number, index: number, total: number) {
  const slot = 0.78 / total;
  const start = index * slot;
  return clamp((progress - start) / (slot * 1.35), 0, 1);
}

export function DifferenceSection() {
  const { t } = useLocale();
  const trackRef = useRef<HTMLDivElement>(null);
  const { progress, reducedMotion } = useDifferenceProgress(trackRef);
  const words = t.difference.title.split(/\s+/);

  return (
    <Section className="go-difference">
      <Container wide>
        <div
          ref={trackRef}
          className={`go-difference__track${reducedMotion ? " go-difference__track--static" : ""}`}
        >
          <div className="go-difference__sticky">
            <div className="go-difference__stage">
              <h2 className="go-difference__title" aria-label={t.difference.title}>
                {words.map((word, index) => {
                  const tWord = reducedMotion ? 1 : wordReveal(progress, index, words.length);
                  const alpha = 0.1 + tWord * 0.9;
                  return (
                    <span
                      key={`${word}-${index}`}
                      className="go-difference__word"
                      aria-hidden={tWord < 0.05}
                      style={{ opacity: alpha }}
                    >
                      {word}
                      {index < words.length - 1 ? " " : ""}
                    </span>
                  );
                })}
              </h2>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
