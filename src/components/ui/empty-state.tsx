type EmptyStateProps = {
  title: string;
  description: string;
};

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-zg-border-strong/90 bg-zg-surface-elevated/80 px-6 py-12 text-center shadow-zg-soft backdrop-blur-sm">
      <p className="text-sm font-semibold text-zg-fg">{title}</p>
      <p className="mt-2 text-sm text-zg-fg/55">{description}</p>
    </div>
  );
}
