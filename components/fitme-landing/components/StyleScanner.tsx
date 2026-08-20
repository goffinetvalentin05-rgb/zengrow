"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { STYLE_SCAN_LOOKS } from "../config";
import { DemoCaption } from "../ui";
import { cn } from "@/src/lib/utils";

const SCAN_MS = 2400;
const REVEAL_MS = 1000;
const HOLD_MS = 1300;
const REDUCE_HOLD_MS = 3800;
const REDUCE_REVEAL_MS = 900;

type Phase = "hold" | "scan" | "reveal";

export function StyleScanner() {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("hold");

  const looks = STYLE_SCAN_LOOKS;
  const nextIndex = (index + 1) % looks.length;
  const current = looks[index];
  const incoming = looks[nextIndex];
  const scanning = phase === "scan" && !reduce && inView;
  const revealing = phase === "reveal";

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.32 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;

    const duration = reduce
      ? phase === "reveal"
        ? REDUCE_REVEAL_MS
        : REDUCE_HOLD_MS
      : phase === "scan"
        ? SCAN_MS
        : phase === "reveal"
          ? REVEAL_MS
          : HOLD_MS;

    const timer = window.setTimeout(() => {
      if (reduce) {
        if (phase === "hold") {
          setPhase("reveal");
          return;
        }
        setIndex((value) => (value + 1) % looks.length);
        setPhase("hold");
        return;
      }

      if (phase === "hold") setPhase("scan");
      else if (phase === "scan") setPhase("reveal");
      else {
        setIndex((value) => (value + 1) % looks.length);
        setPhase("hold");
      }
    }, duration);

    return () => window.clearTimeout(timer);
  }, [inView, phase, reduce, looks.length]);

  const status = scanning
    ? "Analyse du style…"
    : revealing
      ? incoming.label
      : current.label;

  return (
    <div className="fitme-scan-block" ref={rootRef}>
      <div
        className={cn(
          "fitme-scan",
          scanning && "is-scanning",
          revealing && "is-revealing",
        )}
        aria-label={`Démonstration : ${status}`}
      >
        {looks.map((look, lookIndex) => {
          const isCurrent = lookIndex === index;
          const isIncoming = lookIndex === nextIndex;
          const shown = isCurrent || (revealing && isIncoming);

          return (
            <div
              key={look.id}
              className={cn(
                "fitme-scan__frame",
                shown && "is-shown",
                revealing && isIncoming && "is-front",
              )}
            >
              <Image
                src={look.image}
                alt=""
                fill
                sizes="(max-width: 768px) 92vw, 420px"
                priority={lookIndex < 2}
              />
            </div>
          );
        })}

        <div className="fitme-scan__grade" aria-hidden />
        <div className="fitme-scan__corners" aria-hidden>
          <i className="is-tl" />
          <i className="is-tr" />
          <i className="is-bl" />
          <i className="is-br" />
        </div>
        <div className="fitme-scan__wash" aria-hidden />
        <div className="fitme-scan__beam" aria-hidden />
        <div className="fitme-scan__flash" aria-hidden />

        <p className="fitme-scan__status" aria-live="polite">
          <span className="fitme-scan__status-dot" aria-hidden />
          {status}
        </p>
      </div>

      <DemoCaption>
        Exemple de démonstration — la même personne, plusieurs univers.
      </DemoCaption>
    </div>
  );
}
