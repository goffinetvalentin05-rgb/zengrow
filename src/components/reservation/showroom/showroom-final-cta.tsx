"use client";

/** Bloc de conversion final */
export function ShowroomFinalCta({
  title = "Votre table vous attend",
  subtitle = "Réservez en quelques clics — confirmation rapide.",
  buttonLabel,
  onReserve,
}: {
  title?: string;
  subtitle?: string;
  buttonLabel: string;
  onReserve: () => void;
}) {
  return (
    <section className="zg-showroom-final-cta relative overflow-hidden py-16 sm:py-24">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 100% 80% at 50% 0%, color-mix(in srgb, var(--button-bg) 18%, transparent) 0%, transparent 55%), linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--button-bg) 4%, var(--page-bg)) 100%)",
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-lg px-5 text-center sm:max-w-xl sm:px-6">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.32em]"
          style={{ color: "var(--accent-color)" }}
        >
          Réservation
        </p>
        <h2
          className="mt-4 text-balance text-[clamp(1.75rem,5.5vw,2.5rem)] font-medium leading-[1.05] tracking-tight"
          style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}
        >
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed opacity-60" style={{ color: "var(--body-text)" }}>
          {subtitle}
        </p>
        <button
          type="button"
          onClick={onReserve}
          className="zg-showroom-hero-cta zg-showroom-hero-cta--primary zg-showroom-hero-cta--large mt-9 w-full max-w-md"
        >
          {buttonLabel}
        </button>
      </div>
    </section>
  );
}
