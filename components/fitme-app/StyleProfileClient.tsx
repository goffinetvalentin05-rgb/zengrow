"use client";

import { useEffect, useState } from "react";
import { FitmeAppShell } from "@/components/fitme-app/FitmeAppShell";
import { trackFitmeEvent } from "@/src/lib/fitme/analytics";
import type { UnlockedStyleProfile } from "@/src/lib/style-analysis/serialize";

export function StyleProfileClient({ analysisId }: { analysisId: string }) {
  const [profile, setProfile] = useState<UnlockedStyleProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openLook, setOpenLook] = useState<string | null>(null);

  useEffect(() => {
    trackFitmeEvent("style_profile_viewed");
    void fetch(`/api/style/analyses/${analysisId}?view=full`)
      .then(async (response) => {
        const data = await response.json();
        if (response.status === 403) {
          window.location.href = `/analysis/${analysisId}/preview`;
          return;
        }
        if (!response.ok) throw new Error(data.error ?? "Impossible de charger le Style Profile.");
        setProfile(data.profile as UnlockedStyleProfile);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Erreur"));
  }, [analysisId]);

  if (error) {
    return (
      <FitmeAppShell>
        <section className="fitme-flow">
          <h1>Votre Style Profile</h1>
          <p className="fitme-error">{error}</p>
          <button type="button" className="fitme-cta" onClick={() => window.location.reload()}>
            Réessayer
          </button>
        </section>
      </FitmeAppShell>
    );
  }

  if (!profile) {
    return (
      <FitmeAppShell>
        <section className="fitme-flow">
          <p className="fitme-lead">Chargement de votre Style Profile…</p>
        </section>
      </FitmeAppShell>
    );
  }

  const cover = profile.looks[0]?.url;

  return (
    <FitmeAppShell>
      <section className="fitme-flow" style={{ width: "min(40rem, calc(100% - 2rem))" }}>
        <p className="fitme-eyebrow">Votre Style Profile</p>
        <h1>Votre Style Profile</h1>
        <p className="fitme-fine">
          Créé le {new Date(profile.createdAt).toLocaleDateString("fr-CH")}
        </p>

        <article className="fitme-report is-in" style={{ marginTop: "1.4rem" }}>
          <div className="fitme-report__glow" aria-hidden />
          <header className="fitme-report__head">
            <p>Top style</p>
          </header>
          <div className="fitme-report__hero">
            {cover ? (
              <div className="fitme-report__cover">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cover} alt={profile.primaryStyle.name} />
              </div>
            ) : null}
            <div className="fitme-report__lead">
              <p>Top style</p>
              <strong>{profile.primaryStyle.name}</strong>
              <span className="fitme-report__badge">{Math.round(profile.primaryStyle.score)} — match visuel</span>
              <em>{profile.primaryStyle.reason}</em>
            </div>
          </div>

          <div className="fitme-report__palette">
            <div>
              <p>Style secondaire</p>
              <strong className="fitme-display" style={{ fontSize: "1.6rem" }}>
                {profile.secondaryStyle.name}
              </strong>
              <p className="fitme-lead">{profile.secondaryStyle.reason}</p>
            </div>
          </div>

          <div className="fitme-report__palette">
            <div>
              <p>Your colors</p>
              <ul className="fitme-swatches">
                {profile.bestColors.map((color) => (
                  <li key={color.hex}>
                    <i style={{ background: color.hex }} />
                    {color.name}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p>Colors to use less</p>
              <ul className="fitme-swatches">
                {profile.lessFlatteringColors.map((color) => (
                  <li key={color.hex}>
                    <i style={{ background: color.hex }} />
                    {color.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="fitme-report__looks-wrap">
            <p>Your looks</p>
            <div className="fitme-look-grid">
              {profile.looks.map((look) => (
                <button key={look.id} type="button" onClick={() => setOpenLook(look.url)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={look.url} alt={look.style} />
                </button>
              ))}
            </div>
          </div>

          <ul className="fitme-tips">
            {profile.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </article>
      </section>

      {openLook ? (
        <button type="button" className="fitme-lightbox" onClick={() => setOpenLook(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={openLook} alt="" />
        </button>
      ) : null}
    </FitmeAppShell>
  );
}
