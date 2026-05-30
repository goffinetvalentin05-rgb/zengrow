export function AnimatedBackground() {
  return (
    <div className="zg-landing-bg pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="zg-landing-bg__orb zg-landing-bg__orb--violet zg-bg-orb" />
      <div className="zg-landing-bg__orb zg-landing-bg__orb--cyan zg-bg-orb" />
      <div className="zg-landing-bg__orb zg-landing-bg__orb--magenta zg-bg-orb" />
      <div className="zg-bg-grid zg-landing-bg__grid" />
      <div className="zg-landing-bg__top-glow absolute inset-0" />
    </div>
  );
}
