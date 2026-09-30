export function DataError({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-4 text-sm text-red-100">{message}</div>
  );
}

export function LoadingBlock() {
  return (
    <div className="space-y-3" aria-busy>
      <div className="h-8 w-40 animate-pulse rounded-xl bg-white/10" />
      <div className="h-28 animate-pulse rounded-2xl bg-white/5" />
      <div className="h-28 animate-pulse rounded-2xl bg-white/5" />
    </div>
  );
}
