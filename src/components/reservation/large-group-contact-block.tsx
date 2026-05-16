"use client";

import { Phone } from "lucide-react";

function phoneTelHref(phone: string | null | undefined): string | null {
  const digits = (phone ?? "").replace(/\D/g, "");
  return digits.length >= 8 ? `tel:${digits}` : null;
}

type LargeGroupContactBlockProps = {
  maxPartySize: number;
  restaurantPhone?: string | null;
};

export function LargeGroupContactBlock({ maxPartySize, restaurantPhone }: LargeGroupContactBlockProps) {
  const telHref = phoneTelHref(restaurantPhone);
  const phoneDisplay = restaurantPhone?.trim() ?? null;

  return (
    <div
      role="status"
      className="rounded-2xl border border-amber-500/35 bg-amber-500/10 px-5 py-6 text-center"
    >
      <p className="text-base font-semibold leading-snug" style={{ color: "var(--heading-color)" }}>
        Pour les groupes de plus de {maxPartySize} personnes, merci de nous contacter directement
        {phoneDisplay ? (
          <>
            {" "}
            au{" "}
            {telHref ? (
              <a
                href={telHref}
                className="inline-flex items-center gap-1 font-semibold underline underline-offset-2"
                style={{ color: "var(--accent-color)" }}
              >
                <Phone className="h-4 w-4 shrink-0" aria-hidden />
                {phoneDisplay}
              </a>
            ) : (
              <span className="font-semibold">{phoneDisplay}</span>
            )}
          </>
        ) : (
          " par téléphone"
        )}
        .
      </p>
      {!phoneDisplay ? (
        <p className="mt-3 text-sm leading-relaxed" style={{ color: "color-mix(in srgb, var(--body-text) 70%, var(--page-bg))" }}>
          Les réservations en ligne ne sont pas disponibles pour les grands groupes. Contactez le restaurant pour
          organiser votre venue.
        </p>
      ) : null}
    </div>
  );
}

