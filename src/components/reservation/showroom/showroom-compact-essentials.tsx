"use client";

/** Infos discrètes — texte simple, pas de chips ni footer */
export function ShowroomCompactEssentials({
  hoursSummary,
  city,
  address,
  googleMapsUrl,
  instagramUrl,
  facebookUrl,
  tiktokUrl,
  websiteUrl,
}: {
  hoursSummary?: string | null;
  city?: string | null;
  address?: string | null;
  googleMapsUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  tiktokUrl?: string | null;
  websiteUrl?: string | null;
}) {
  const hours = hoursSummary?.trim();
  const place = city?.trim() || address?.trim();
  const maps = googleMapsUrl?.trim();

  const socialLabels: { href: string; label: string }[] = [];
  if (instagramUrl?.trim()) socialLabels.push({ href: instagramUrl.trim(), label: "Instagram" });
  if (facebookUrl?.trim()) socialLabels.push({ href: facebookUrl.trim(), label: "Facebook" });
  if (tiktokUrl?.trim()) socialLabels.push({ href: tiktokUrl.trim(), label: "TikTok" });
  if (websiteUrl?.trim()) socialLabels.push({ href: websiteUrl.trim(), label: "Site" });

  if (!hours && !place && socialLabels.length === 0) return null;

  return (
    <div className="zg-showroom-essentials">
      {hours ? <p className="zg-showroom-essentials-text">{hours}</p> : null}
      {place ? (
        <p className="zg-showroom-essentials-text">
          {maps ? (
            <a href={maps} target="_blank" rel="noopener noreferrer" className="zg-showroom-essentials-link">
              {place}
            </a>
          ) : (
            place
          )}
        </p>
      ) : null}
      {socialLabels.length > 0 ? (
        <p className="zg-showroom-essentials-text zg-showroom-essentials-socials">
          {socialLabels.map((s, i) => (
            <span key={s.label}>
              {i > 0 ? <span className="zg-showroom-essentials-sep"> · </span> : null}
              <a href={s.href} target="_blank" rel="noopener noreferrer" className="zg-showroom-essentials-link">
                {s.label}
              </a>
            </span>
          ))}
        </p>
      ) : null}
    </div>
  );
}
