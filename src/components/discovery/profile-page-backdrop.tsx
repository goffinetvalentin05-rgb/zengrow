import { resolvePageBackground } from "@/src/lib/discovery/appearance";

export function ProfilePageBackdrop({
  pageKey,
  imageUrl,
}: {
  pageKey?: string | null;
  imageUrl?: string | null;
}) {
  const bg = resolvePageBackground(pageKey);
  const photo = imageUrl?.trim() || null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0" style={{ backgroundColor: bg.base }} />
      {photo ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/68 to-black/88" />
          <div className="absolute inset-0 bg-black/20" />
        </>
      ) : (
        bg.layers.map((layer) => (
          <div key={layer} className="absolute inset-0" style={{ background: layer }} />
        ))
      )}
      <div
        className="absolute inset-0"
        style={{
          opacity: photo ? 0.035 : bg.grain,
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.18) 1px, transparent 0)",
          backgroundSize: "18px 18px",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, transparent 38%, rgba(0,0,0,${photo ? 0.5 : bg.vignette}) 100%)`,
        }}
      />
    </div>
  );
}
