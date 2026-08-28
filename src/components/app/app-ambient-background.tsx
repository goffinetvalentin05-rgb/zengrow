"use client";

/** Fond dashboard — noir mat, glow argent très discret. */
export function AppAmbientBackground() {
  return (
    <div className="zg-app-backdrop pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[#050506]" />
      <div
        className="absolute left-1/2 top-[-16%] h-[min(480px,62vw)] w-[min(680px,80vw)] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 50% 40%, rgba(255,255,255,0.032) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.14) 1px, transparent 0)",
          backgroundSize: "36px 36px",
          WebkitMaskImage: "radial-gradient(ellipse 68% 52% at 50% 16%, black, transparent 78%)",
          maskImage: "radial-gradient(ellipse 68% 52% at 50% 16%, black, transparent 78%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 115% 80% at 50% 0%, transparent 38%, rgba(0,0,0,0.72) 100%)",
        }}
      />
    </div>
  );
}
