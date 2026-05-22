export function AnimatedBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="zg-lp-grid-bg" />
      <div className="zg-lp-orb zg-lp-orb--hero" />
      <div
        className="zg-lp-orb zg-lp-orb--section"
        style={{ top: "35%", right: "-8%", background: "rgba(168, 85, 247, 0.18)" }}
      />
      <div
        className="zg-lp-orb zg-lp-orb--section"
        style={{ bottom: "15%", left: "-10%", background: "rgba(99, 102, 241, 0.14)" }}
      />
    </div>
  );
}
