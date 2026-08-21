"use client";

import { useEffect, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { FitmeAppShell } from "@/components/fitme-app/FitmeAppShell";
import { FitmeErrorState } from "@/components/fitme-app/FitmeErrorState";
import { trackFitmeEvent } from "@/src/lib/fitme/analytics";
import { apiJson } from "@/src/lib/fitme/client-api";
import type { UnlockedStyleProfile } from "@/src/lib/style-analysis/serialize";

function ScoreBadge({ score }: { score: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView || reduce) {
      if (inView) setValue(score);
      return;
    }
    const start = performance.now();
    const frame = (now: number) => {
      const progress = Math.min(1, (now - start) / 900);
      setValue(Math.round(score * progress));
      if (progress < 1) requestAnimationFrame(frame);
    };
    const id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, [inView, reduce, score]);

  return (
    <span ref={ref} className="fitme-report__badge">
      {reduce || !inView ? score : value}%
    </span>
  );
}

function RevealSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-48px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function StyleProfileClient({
  analysisId,
  firstName,
}: {
  analysisId: string;
  firstName?: string | null;
}) {
  const [profile, setProfile] = useState<UnlockedStyleProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openLook, setOpenLook] = useState<string | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    trackFitmeEvent("style_profile_viewed");
    void apiJson<{ profile: UnlockedStyleProfile }>(`/api/style-analysis/${analysisId}/result`)
      .then((data) => setProfile(data.profile))
      .catch((err: unknown) => {
        if (err instanceof Error && err.message.includes("débloqué")) {
          window.location.href = `/analysis/${analysisId}/preview`;
          return;
        }
        setError(err instanceof Error ? err.message : "Impossible de charger le Style Profile.");
      });
  }, [analysisId]);

  if (error) {
    return (
      <FitmeAppShell>
        <FitmeErrorState title="Style Profile indisponible." message={error} onAction={() => window.location.reload()} />
      </FitmeAppShell>
    );
  }

  if (!profile) {
    return (
      <FitmeAppShell>
        <section className="fitme-flow fitme-profile-page">
          <p className="fitme-eyebrow">Style Profile</p>
          <div className="fitme-skeleton" style={{ width: "70%", height: "2.2rem" }} />
          <div className="fitme-skeleton" style={{ width: "92%", marginTop: "1.1rem" }} />
          <div className="fitme-skeleton" style={{ width: "64%" }} />
          <div className="fitme-loading-line" aria-hidden>
            <span />
          </div>
        </section>
      </FitmeAppShell>
    );
  }

  const cover = profile.looks[0]?.url;
  const hello = firstName || profile.firstName;

  async function downloadLook(url: string, index: number) {
    const response = await fetch(url);
    const blob = await response.blob();
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = `fitme-look-${index + 1}.jpg`;
    link.click();
    URL.revokeObjectURL(href);
  }

  return (
    <FitmeAppShell>
      <section className="fitme-flow fitme-profile-page">
        <p className="fitme-eyebrow">Votre Style Profile</p>
        <h1>{hello ? `${hello}, voici ce qui vous va.` : "Votre Style Profile"}</h1>
        <p className="fitme-lead">Un rapport personnel : vos univers, vos couleurs, vos looks.</p>

        <article className="fitme-report is-in" style={{ marginTop: "1.55rem" }}>
          <div className="fitme-report__glow" aria-hidden />
          <RevealSection>
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
                <p>Style principal</p>
                <strong>{profile.primaryStyle.name}</strong>
                <ScoreBadge score={Math.round(profile.primaryStyle.score)} />
                <em>{profile.primaryStyle.reason}</em>
              </div>
            </div>
          </RevealSection>

          <RevealSection className="fitme-report__palette">
            <div>
              <p>Style secondaire</p>
              <strong className="fitme-display" style={{ fontSize: "1.7rem" }}>
                {profile.secondaryStyle.name}
              </strong>
              <ScoreBadge score={Math.round(profile.secondaryStyle.score)} />
              <p className="fitme-lead">{profile.secondaryStyle.reason}</p>
            </div>
          </RevealSection>

          <RevealSection className="fitme-report__palette">
            <div>
              <p>Couleurs qui vous vont</p>
              <p className="fitme-lead" style={{ marginTop: "0.4rem" }}>
                Ces teintes travaillent avec votre contraste, plutôt que contre lui.
              </p>
              <ul className="fitme-report__swatches">
                {profile.bestColors.map((color, index) => (
                  <motion.li
                    key={color.hex}
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <i style={{ background: color.hex }} />
                    {color.name}
                  </motion.li>
                ))}
              </ul>
            </div>
            <div>
              <p>Couleurs à éviter</p>
              <ul className="fitme-report__swatches is-avoid">
                {profile.lessFlatteringColors.map((color) => (
                  <li key={color.hex}>
                    <i style={{ background: color.hex }} />
                    {color.name}
                  </li>
                ))}
              </ul>
            </div>
          </RevealSection>

          <RevealSection className="fitme-report__looks-wrap">
            <p>Vos looks</p>
            <div className="fitme-looks-carousel">
              {profile.looks.map((look, index) => (
                <figure key={look.id}>
                  <button type="button" onClick={() => setOpenLook(look.url)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={look.url} alt={look.style} />
                  </button>
                  <figcaption>{look.style}</figcaption>
                  <button type="button" className="fitme-look-download" onClick={() => void downloadLook(look.url, index)}>
                    Télécharger
                  </button>
                </figure>
              ))}
            </div>
          </RevealSection>

          {profile.notes.length ? (
            <RevealSection>
              <p className="fitme-eyebrow" style={{ marginTop: "1.4rem" }}>
                Notes
              </p>
              <ul className="fitme-tips">
                {profile.notes.slice(0, 4).map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </RevealSection>
          ) : null}
        </article>

        <RevealSection>
          <article className="fitme-share-card">
            <p className="fitme-eyebrow">Partager</p>
            <h2>Partager mon Style Profile</h2>
            <p className="fitme-lead">Bientôt disponible, sans exposer vos photos sources.</p>
            <button type="button" className="fitme-cta fitme-cta--ghost" disabled>
              Bientôt
            </button>
          </article>
        </RevealSection>

        <RevealSection>
          <article className="fitme-fitcheck">
            <div className="fitme-fitcheck__copy">
              <p>FitCheck</p>
              <strong>Vous hésitez avant d’acheter ?</strong>
              <span>Vérifiez bientôt si un vêtement correspond à votre Style Profile.</span>
            </div>
          </article>
        </RevealSection>
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
