"use client";

import { useLayoutEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

type Token = { kind: "word"; text: string; em: boolean } | { kind: "space"; text: string };

type StoryStep = {
  count: string;
  title: string;
  text: string;
  highlights: string[];
};

const STEPS: StoryStep[] = [
  {
    count: "01 / 03",
    title: "Le problème",
    text: "Un client veut offrir votre établissement. Il ne trouve aucun moyen simple de le faire, abandonne… ou choisit un concurrent.",
    highlights: ["choisit un concurrent"],
  },
  {
    count: "02 / 03",
    title: "La solution",
    text: "Grâce à ZifTip, ajoutez vos bons cadeaux sur votre site, dans votre établissement et sur vos réseaux, sans avoir à créer votre propre système.",
    highlights: ["Grâce à ZifTip"],
  },
  {
    count: "03 / 03",
    title: "Le résultat",
    text: "Vos clients peuvent acheter et offrir en quelques secondes, vous récupérez des ventes supplémentaires et augmentez votre chiffre d’affaires, pendant que toute la gestion reste centralisée dans ZifTip.",
    highlights: ["ventes supplémentaires", "augmentez votre chiffre d’affaires"],
  },
];

const MUTED = [197, 193, 184] as const;
const INK = [20, 20, 19] as const;
const INK_EM = [10, 10, 9] as const;

function tokenize(text: string, highlights: string[]): Token[] {
  const ranges = highlights
    .map((phrase) => {
      const start = text.indexOf(phrase);
      return start === -1 ? null : { start, end: start + phrase.length };
    })
    .filter((range): range is { start: number; end: number } => range !== null);

  const parts = text.split(/(\s+)/);
  let cursor = 0;
  return parts.map((part) => {
    const start = cursor;
    cursor += part.length;
    if (/^\s+$/.test(part)) return { kind: "space" as const, text: part };
    const em = ranges.some((range) => start < range.end && start + part.length > range.start);
    return { kind: "word" as const, text: part, em };
  });
}

const STEP_TOKENS = STEPS.map((step) => tokenize(step.text, step.highlights));

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function smoothstep(t: number) {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
}

function mix(from: readonly number[], to: readonly number[], t: number) {
  const r = Math.round(from[0] + (to[0] - from[0]) * t);
  const g = Math.round(from[1] + (to[1] - from[1]) * t);
  const b = Math.round(from[2] + (to[2] - from[2]) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

function stepOpacity(index: number, progress: number) {
  const fade = 0.038;
  const start = index / 3;
  const end = (index + 1) / 3;

  if (index === 0) {
    if (progress <= end - fade) return 1;
    if (progress >= end + fade) return 0;
    return 1 - smoothstep((progress - (end - fade)) / (2 * fade));
  }

  if (index === 2) {
    if (progress >= start + fade) return 1;
    if (progress <= start - fade) return 0;
    return smoothstep((progress - (start - fade)) / (2 * fade));
  }

  if (progress <= start - fade || progress >= end + fade) return 0;
  if (progress < start + fade) return smoothstep((progress - (start - fade)) / (2 * fade));
  if (progress > end - fade) return 1 - smoothstep((progress - (end - fade)) / (2 * fade));
  return 1;
}

function localProgress(index: number, progress: number) {
  const start = index / 3 - 0.035;
  const end = (index + 1) / 3 - 0.07;
  return clamp((progress - start) / Math.max(end - start, 0.001));
}

export function StorySection() {
  const reduce = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLSpanElement>(null);
  const metaRefs = useRef<Array<HTMLDivElement | null>>([]);
  const copyRefs = useRef<Array<HTMLParagraphElement | null>>([]);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const copies = copyRefs.current;
    const metas = metaRefs.current;
    const wordLists = copies.map((copy) =>
      copy ? Array.from(copy.querySelectorAll<HTMLElement>("[data-word]")) : [],
    );

    let frame = 0;
    let last = -1;

    const paint = (progress: number) => {
      if (railRef.current) {
        railRef.current.style.transform = `scaleY(${progress})`;
      }

      STEPS.forEach((_, index) => {
        const opacity = stepOpacity(index, progress);
        const mid = (index + 0.5) / 3;
        const y = reduce ? 0 : (1 - opacity) * (progress < mid ? 12 : -10);
        const visible = opacity > 0.04;

        const meta = metas[index];
        if (meta) {
          meta.style.opacity = String(opacity);
          meta.style.transform = y ? `translate3d(0, ${y}px, 0)` : "none";
          meta.style.pointerEvents = opacity > 0.5 ? "auto" : "none";
          meta.setAttribute("aria-hidden", visible ? "false" : "true");
        }

        const copy = copies[index];
        if (copy) {
          copy.style.opacity = String(opacity);
          copy.style.transform = y ? `translate3d(0, ${y}px, 0)` : "none";
          copy.style.pointerEvents = opacity > 0.5 ? "auto" : "none";
          copy.setAttribute("aria-hidden", visible ? "false" : "true");
        }

        const words = wordLists[index];
        const count = Math.max(words.length, 1);
        const local = reduce ? 1 : localProgress(index, progress);

        words.forEach((word, wordIndex) => {
          const emphasized = word.dataset.em === "true";
          const start = (wordIndex / count) * 0.58;
          const t = reduce ? 1 : smoothstep((local - start) / 0.48);
          word.style.color = mix(MUTED, emphasized ? INK_EM : INK, t);
          if (emphasized) word.style.fontWeight = String(Math.round(500 + 120 * t));
        });
      });
    };

    const measure = () => {
      frame = 0;
      const rect = track.getBoundingClientRect();
      const range = rect.height - window.innerHeight;
      const progress = range <= 0 ? 1 : clamp(-rect.top / range);
      if (Math.abs(progress - last) < 0.0008) return;
      last = progress;
      paint(progress);
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [reduce]);

  return (
    <section id="comment-ca-marche" className="go-story" aria-label="Le problème, la solution, le résultat">
      <div className="go-story__track" ref={trackRef}>
        <div className="go-story__sticky">
          <div className="go-story__frame">
            <div className="go-story__left">
              <span className="go-story__rail" aria-hidden>
                <span className="go-story__rail-fill" ref={railRef} />
              </span>
              <div className="go-story__meta">
                {STEPS.map((step, index) => (
                  <div
                    key={step.count}
                    className="go-story__meta-item"
                    ref={(node) => {
                      metaRefs.current[index] = node;
                    }}
                    aria-hidden={index !== 0}
                  >
                    <p className="go-story__count">{step.count}</p>
                    <h2 className="go-story__kicker">{step.title}</h2>
                  </div>
                ))}
              </div>
            </div>

            <div className="go-story__right">
              {STEPS.map((step, index) => (
                <p
                  key={step.count}
                  className="go-story__copy"
                  ref={(node) => {
                    copyRefs.current[index] = node;
                  }}
                  aria-hidden={index !== 0}
                >
                  {STEP_TOKENS[index].map((token, tokenIndex) =>
                    token.kind === "space" ? (
                      <span key={tokenIndex}>{token.text}</span>
                    ) : (
                      <span
                        key={tokenIndex}
                        data-word=""
                        data-em={token.em ? "true" : "false"}
                        className={token.em ? "go-story__w go-story__w--em" : "go-story__w"}
                      >
                        {token.text}
                      </span>
                    ),
                  )}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
