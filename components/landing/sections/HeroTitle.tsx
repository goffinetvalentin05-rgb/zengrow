"use client";

import { useEffect, useState } from "react";

type HeroTitleProps = {
  lead: string;
  lines: readonly string[];
};

const ROTATE_MS = 3200;

export function HeroTitle({ lead, lines }: HeroTitleProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (lines.length <= 1) return;

    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % lines.length);
    }, ROTATE_MS);

    return () => window.clearInterval(id);
  }, [lines.length]);

  return (
    <h1 className="go-hero__title">
      <span className="go-hero__title-static">{lead}</span>
      <span className="go-hero__title-stack">
        {lines.map((line, i) => (
          <span
            key={line}
            className={i === index ? "go-hero__title-phrase is-active" : "go-hero__title-phrase"}
            aria-hidden={i === index ? undefined : true}
          >
            {line}
          </span>
        ))}
      </span>
    </h1>
  );
}
