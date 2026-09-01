"use client";

type HeroTitleProps = {
  lead: string;
  lines: readonly string[];
};

export function HeroTitle({ lead, lines }: HeroTitleProps) {
  const loop = [...lines, lines[0]!];

  return (
    <h1 className="go-hero__title">
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
    </h1>
  );
}
