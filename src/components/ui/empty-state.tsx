type EmptyStateProps = {
  title: string;
  description: string;
};

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-[rgba(0,0,0,0.08)] bg-[var(--surface-muted)]/60 px-6 py-10 text-center">
      <p className="text-sm font-semibold text-[var(--foreground)]">{title}</p>
      <p className="mt-1.5 text-sm text-[var(--muted-foreground)]">{description}</p>
    </div>
  );
}
