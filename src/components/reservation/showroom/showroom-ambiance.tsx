"use client";

/** Présentation courte du restaurant — 2 à 4 lignes max */
export function ShowroomAmbiance({
  title = "L'expérience",
  body,
}: {
  title?: string;
  body: string;
}) {
  const text = body.trim();
  if (!text) return null;

  return (
    <section className="zg-showroom-ambiance scroll-mt-0 px-5 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-lg sm:max-w-xl md:max-w-2xl">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.28em]"
          style={{ color: "var(--accent-color)" }}
        >
          {title}
        </p>
        <p
          className="mt-4 max-w-md text-pretty text-[clamp(1.05rem,3.6vw,1.2rem)] font-light leading-relaxed"
          style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}
        >
          {text}
        </p>
      </div>
    </section>
  );
}
