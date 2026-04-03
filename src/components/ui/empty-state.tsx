type EmptyStateProps = {
  title: string;
  description: string;
};

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-[20px] border border-dashed border-[var(--border)] bg-[var(--surface-muted)]/70 px-8 py-12 text-center">
      <p className="text-[15px] font-semibold text-[var(--foreground)]">{title}</p>
      <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted-foreground)]">{description}</p>
    </div>
  );
}
