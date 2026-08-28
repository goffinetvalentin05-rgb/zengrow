"use client";

/** Fond dashboard — charbon + halo mauve fumé, très discret. */
export function AppAmbientBackground() {
  return (
    <div className="zg-app-backdrop pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[#08070b]" />
      <div
        className="absolute -left-[18%] top-[-22%] h-[min(720px,90vw)] w-[min(720px,90vw)] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(155,122,173,0.16) 0%, rgba(120,80,140,0.05) 38%, transparent 70%)",
        }}
      />
      <div
        className="absolute -right-[12%] bottom-[-28%] h-[min(640px,80vw)] w-[min(640px,80vw)] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(180,130,160,0.12) 0%, transparent 68%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.16) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}
