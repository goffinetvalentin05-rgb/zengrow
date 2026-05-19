"use client";

/** Infos pratiques discrètes — pied de page, pas une section « site » */
export function ShowroomEssentials({
  address,
  googleMapsUrl,
}: {
  address?: string | null;
  googleMapsUrl?: string | null;
}) {
  const hasAddress = Boolean(address?.trim());
  const hasMap = Boolean(googleMapsUrl?.trim());
  if (!hasAddress && !hasMap) return null;

  return (
    <footer className="zg-showroom-footer border-t border-[color-mix(in_srgb,var(--body-text)_6%,transparent)] py-10">
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-6 text-center">
        {hasAddress ? (
          <p className="text-[13px] leading-relaxed opacity-45" style={{ color: "var(--body-text)" }}>
            {address!.trim()}
          </p>
        ) : null}
        {hasMap ? (
          <a
            href={googleMapsUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] font-medium tracking-wide opacity-50 underline-offset-4 transition hover:opacity-80 hover:underline"
            style={{ color: "var(--accent-color)" }}
          >
            Itinéraire
          </a>
        ) : null}
      </div>
    </footer>
  );
}
