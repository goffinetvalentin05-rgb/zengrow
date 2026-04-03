type EmptyStateProps = {
  title: string;
  description: string;
};

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="py-12 text-center">
      <p className="text-sm font-medium text-gray-900">{title}</p>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
    </div>
  );
}
