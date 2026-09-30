export default function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="max-w-xl">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-white/55">{description}</p>
      <div className="mt-8 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-5 py-8 text-sm text-white/45">
        This section is ready. The learning tools will be added here next.
      </div>
    </section>
  );
}
