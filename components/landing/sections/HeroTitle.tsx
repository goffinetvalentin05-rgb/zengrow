"use client";

import { useLayoutEffect, useRef } from "react";

type HeroTitleProps = {
  lead: string;
  lines: readonly string[];
};

export function HeroTitle({ lead, lines }: HeroTitleProps) {
  const loop = lines.length > 0 ? [...lines, lines[0]!] : [];
  const titleRef = useRef<HTMLHeadingElement>(null);
  const sizerRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const title = titleRef.current;
    const sizer = sizerRef.current;
    if (!title || !sizer) return;

    const apply = () => {
      let maxHeight = sizer.getBoundingClientRect().height;
      sizer.querySelectorAll<HTMLElement>(".go-hero__title-phrase").forEach((el) => {
        const box = el.getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(el);
        const ink = range.getBoundingClientRect();
        maxHeight = Math.max(maxHeight, box.height, ink.height, el.scrollHeight);
      });
      const height = Math.ceil(maxHeight);
      if (height > 0 && title.style.getPropertyValue("--go-hero-rotate-slot-h") !== `${height}px`) {
        title.style.setProperty("--go-hero-rotate-slot-h", `${height}px`);
      }
    };

    apply();

    const observer = new ResizeObserver(apply);
    observer.observe(sizer);
    observer.observe(title);

    const fonts = document.fonts;
    fonts?.ready.then(apply);
    fonts?.addEventListener?.("loadingdone", apply);
    window.addEventListener("resize", apply);

    return () => {
      observer.disconnect();
      fonts?.removeEventListener?.("loadingdone", apply);
      window.removeEventListener("resize", apply);
    };
  }, [lines]);

  return (
    <h1 ref={titleRef} className="go-hero__title">
      <span className="go-hero__title-static">{lead}</span>
      <span className="go-hero__title-rotate">
        <span ref={sizerRef} className="go-hero__title-sizer" aria-hidden>
          {lines.map((line) => (
            <span key={line} className="go-hero__title-phrase">
              {line}
            </span>
          ))}
        </span>
        <span className="go-hero__title-rotate-viewport">
          <span className="go-hero__title-rotate-track">
            {loop.map((line, index) => (
              <span
                key={`${line}-${index}`}
                className="go-hero__title-phrase go-hero__title-rotate-line"
                aria-hidden={index === loop.length - 1 ? true : undefined}
              >
                {line}
              </span>
            ))}
          </span>
        </span>
      </span>
    </h1>
  );
}
