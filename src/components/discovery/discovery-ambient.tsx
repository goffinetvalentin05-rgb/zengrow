/** Fond Discovery — noir, grain, halo blanc très discret. Pas de mauve SaaS. */
export function DiscoveryAmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[#050506]" />
      <div
        className="absolute -left-[22%] top-[-28%] h-[min(640px,88vw)] w-[min(640px,88vw)] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 68%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.055]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.16) 1px, transparent 0)",
          backgroundSize: "18px 18px",
        }}
      />
    </div>
  );
}
