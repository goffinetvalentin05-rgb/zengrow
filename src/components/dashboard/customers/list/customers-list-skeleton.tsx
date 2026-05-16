export default function CustomersListSkeleton() {
  return (
    <ul className="space-y-2" aria-busy aria-label="Chargement de la liste clients">
      {Array.from({ length: 6 }, (_, i) => (
        <li
          key={i}
          className="h-[5.5rem] animate-pulse rounded-xl border border-zg-border bg-zg-surface sm:h-20"
        />
      ))}
    </ul>
  );
}
