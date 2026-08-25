export function offerGridClass(count: number, columns: 1 | 2 | 3): string {
  if (count <= 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-1 sm:grid-cols-2";
  if (columns === 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  if (columns === 1) return "grid-cols-1";
  return "grid-cols-1 sm:grid-cols-2";
}

export function offerSectionMaxWidth(count: number, configured: "narrow" | "normal" | "wide"): string {
  if (count === 1) return "28rem";
  if (count === 2) return configured === "wide" ? "52rem" : "46rem";
  if (configured === "narrow") return "42rem";
  if (configured === "wide") return "70rem";
  return "58rem";
}
