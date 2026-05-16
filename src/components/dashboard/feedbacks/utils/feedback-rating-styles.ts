export function feedbackRowBorderClass(rating: number): string {
  if (rating >= 5) return "border-zg-success/35";
  if (rating >= 4) return "border-zg-border";
  if (rating >= 3) return "border-zg-warning/40";
  return "border-zg-danger/40";
}

export function feedbackRowHoverClass(rating: number): string {
  if (rating >= 5) return "hover:border-zg-success/50 hover:bg-zg-success-soft-bg/20";
  if (rating >= 4) return "hover:border-zg-border-hover hover:bg-zg-card-hover";
  if (rating >= 3) return "hover:border-zg-warning/55 hover:bg-zg-warning-soft-bg/15";
  return "hover:border-zg-danger/55 hover:bg-zg-danger-soft-bg/15";
}
