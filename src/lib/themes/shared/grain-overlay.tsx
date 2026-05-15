/**
 * Bruit SVG très léger, plein écran (thèmes premium avec `effects.grain`).
 */
export default function GrainOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[5] opacity-[0.04] mix-blend-overlay"
      aria-hidden
      style={{
        backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(
          `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220' viewBox='0 0 220 220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.55'/></svg>`,
        )}")`,
      }}
    />
  );
}
