type EmptyStateProps = {
  title: string;
  description: string;
};

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-zg-border bg-zg-surface-soft/50 px-6 py-12 text-center shadow-zg-soft">
      <p className="text-sm font-semibold text-zg-fg">{title}</p>
      <p className="mt-2 text-sm text-zg-muted">{description}</p>
    </div>
  );
}
