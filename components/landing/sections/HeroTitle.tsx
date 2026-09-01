"use client";

import { useLayoutEffect, useRef } from "react";

type HeroTitleProps = {
  lead: string;
  lines: readonly string[];
};

export function HeroTitle({ lead, lines }: HeroTitleProps) {
  const loop = [...lines, lines[0]!];
  const titleRef = useRef<HTMLHeadingElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const title = titleRef.current;
      const probe = measureRef.current;
      if (!title || !probe) return;

      const probes = probe.querySelectorAll<HTMLElement>("[data-hero-line]");
      let maxHeight = 0;
      probes.forEach((el) => {
        maxHeight = Math.max(maxHeight, el.offsetHeight);
      });

      if (maxHeight > 0) {
        title.style.setProperty("--go-hero-rotate-slot-h", `${maxHeight}px`);
      }
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [lines]);

  return (
    <h1 ref={titleRef} className="go-hero__title">
      <span className="go-hero__title-static">{lead}</span>
      <span className="go-hero__title-rotate">
        <span className="go-hero__title-rotate-viewport">
          <span className="go-hero__title-rotate-track">
            {loop.map((line, index) => (
              <span
                key={`${line}-${index}`}
                className="go-hero__title-rotate-line"
                aria-hidden={index === loop.length - 1 ? true : undefined}
              >
                {line}
              </span>
            ))}
          </span>
        </span>
      </span>
      <span ref={measureRef} className="go-hero__title-measure" aria-hidden>
        {lines.map((line) => (
          <span key={line} data-hero-line className="go-hero__title-rotate-line go-hero__title-rotate-line--measure">
            {line}
          </span>
        ))}
      </span>
    </h1>
  );
}
