export default function FeedbackThankYouPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#06040f] px-4 py-10 text-[#f4f0ff] md:py-16">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgb(124_92_255/0.15),transparent_55%)]"
        aria-hidden
      />
      <section className="zg-premium-card relative z-10 mx-auto max-w-xl p-8">
        <h1 className="font-[family-name:var(--font-zg-display)] text-2xl font-bold tracking-tight text-[#f4f0ff]">
          Merci pour votre retour.
        </h1>
        <p className="mt-3 text-sm text-[#9b8fb8]">
          Votre avis est précieux et nous aide à améliorer notre service.
        </p>
      </section>
    </main>
  );
}
