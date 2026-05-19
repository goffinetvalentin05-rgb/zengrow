"use client";

import Image from "next/image";

/** Ambiance & expérience — texte éditorial + visuel d’atmosphère optionnel */
export function ShowroomAmbiance({
  moodLine,
  atmosphereImageUrl,
  eyebrow = "L'expérience",
}: {
  moodLine?: string;
  atmosphereImageUrl?: string | null;
  eyebrow?: string;
}) {
  const line = moodLine?.trim();
  const image = atmosphereImageUrl?.trim();
  if (!line && !image) return null;

  const shortLine =
    line && line.length <= 160 ? line : line ? line.slice(0, 157).trimEnd() + "…" : null;

  return (
    <section id="ambiance" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-lg px-6 text-center sm:max-w-xl">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.32em]"
          style={{ color: "var(--accent-color)" }}
        >
          {eyebrow}
        </p>
        {shortLine ? (
          <p
            className="mt-6 text-pretty text-[clamp(1.25rem,4.5vw,1.65rem)] font-light leading-[1.45] tracking-tight opacity-92"
            style={{ color: "var(--heading-color)", fontFamily: "var(--heading-font)" }}
          >
            {shortLine}
          </p>
        ) : null}
      </div>

      {image ? (
        <div className="relative mx-auto mt-14 aspect-[4/5] w-[min(88vw,420px)] overflow-hidden sm:mt-16 sm:aspect-[3/4] sm:w-[min(72vw,480px)]">
          <Image
            src={image}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width:640px) 88vw, 480px"
            unoptimized
            priority
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent"
            aria-hidden
          />
        </div>
      ) : null}
    </section>
  );
}
