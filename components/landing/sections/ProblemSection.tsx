"use client";

import Image from "next/image";
import { useLocale } from "../locale-provider";
import { Container, Eyebrow, Section } from "../ui";

function ConstatTitle({ title }: { title: string }) {
  const lastSpace = title.lastIndexOf(" ");
  if (lastSpace < 0) return title;

  return (
    <>
      {title.slice(0, lastSpace + 1)}
      <em className="go-constat__em">{title.slice(lastSpace + 1)}</em>
    </>
  );
}

export function ProblemSection() {
  const { t } = useLocale();
  const copy = t.problem;

  return (
    <Section className="go-problem-v2">
      <Container>
        <header className="go-constat__header">
          <Eyebrow>{copy.label}</Eyebrow>
          <div className="go-constat__intro">
            <h2 className="go-constat__title">
              <ConstatTitle title={copy.title} />
            </h2>
            <p className="go-constat__aside">{copy.aside}</p>
          </div>
        </header>

        <div className="go-constat__stage">
          <figure className="go-mind__frame go-constat__frame">
            <Image
              src="/landing/problem-crowd.jpg"
              alt=""
              fill
              sizes="(max-width: 880px) 100vw, 72rem"
              className="go-mind__img"
              priority
            />
          </figure>

          <div className="go-constat__stat">
            <p className="go-constat__figure">{copy.stat}</p>
            <p className="go-constat__caption">{copy.statCaption}</p>
          </div>
        </div>

        <blockquote className="go-constat__quote">
          <span className="go-constat__mark" aria-hidden>
            “
          </span>
          <p>{copy.quote}</p>
        </blockquote>
      </Container>
    </Section>
  );
}
