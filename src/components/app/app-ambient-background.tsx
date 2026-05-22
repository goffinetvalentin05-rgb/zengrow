"use client";

/** Fond premium (orbes + grille) — aligné sur la landing ZenGrow v3 */
export function AppAmbientBackground() {
  return (
    <div className="zg-app-backdrop pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="zg-dashboard-backdrop__glow-a" />
      <div className="zg-dashboard-backdrop__glow-b" />
      <div className="zg-dashboard-backdrop__glow-c" />
      <div
        className="zg-bg-orb"
        style={{
          width: "min(70vw, 520px)",
          height: "min(70vw, 520px)",
          left: "-10%",
          top: "-15%",
          background: "radial-gradient(circle, rgb(124 92 255 / 0.28) 0%, transparent 70%)",
        }}
      />
      <div
        className="zg-bg-orb"
        style={{
          width: "min(55vw, 420px)",
          height: "min(55vw, 420px)",
          right: "-8%",
          top: "20%",
          background: "radial-gradient(circle, rgb(56 189 248 / 0.18) 0%, transparent 72%)",
        }}
      />
      <div
        className="zg-bg-orb"
        style={{
          width: "min(60vw, 480px)",
          height: "min(60vw, 480px)",
          left: "30%",
          bottom: "-20%",
          background: "radial-gradient(circle, rgb(192 38 211 / 0.14) 0%, transparent 70%)",
        }}
      />
      <div className="zg-bg-grid" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 55% at 50% -5%, rgb(124 92 255 / 0.1), transparent 55%)",
        }}
      />
    </div>
  );
}
