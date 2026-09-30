"use client";

export default function LearnError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-5">
      <p className="text-sm text-red-100">This screen could not load.</p>
      <button type="button" onClick={reset} className="mt-3 text-sm text-white underline-offset-4 hover:underline">
        Try again
      </button>
    </div>
  );
}
