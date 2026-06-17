export function HeroBackground() {
  return (
    <div className="zg-hero-bg" aria-hidden>
      <div className="zg-hero-bg__base" />

      <div className="zg-hero-bg__glow zg-hero-bg__glow--tr" />
      <div className="zg-hero-bg__glow zg-hero-bg__glow--bl" />
      <div className="zg-hero-bg__glow zg-hero-bg__glow--center" />
      <div className="zg-hero-bg__glow zg-hero-bg__glow--fade" />

      <div className="zg-hero-bg__swoosh" />
      <div className="zg-hero-bg__orbit zg-hero-bg__orbit--1" />
      <div className="zg-hero-bg__orbit zg-hero-bg__orbit--2" />

      <div className="zg-hero-bg__stars">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      <div className="zg-hero-bg__grain" />
    </div>
  );
}
