export default function FeedbackThankYouPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#ebf1ff_0,#f4f7fb_45%,#f4f7fb_100%)] px-4 py-10 md:py-16">
      <section className="mx-auto max-w-xl rounded-3xl border border-[var(--border)] bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Merci pour votre retour.</h1>
        <p className="mt-3 text-sm text-[var(--muted-foreground)]">
          Votre avis est précieux et nous aide à améliorer notre service.
        </p>
      </section>
    </main>
  );
}
