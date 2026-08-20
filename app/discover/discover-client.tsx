"use client";

import { FormEvent, useState } from "react";
import { CTA, PRODUCT } from "@/components/fitme-landing/config";
import { Container, CtaButton } from "@/components/fitme-landing/ui";

const SLOTS = [0, 1, 2] as const;

export function DiscoverClient() {
  const [files, setFiles] = useState<(string | null)[]>([null, null, null]);
  const [submitted, setSubmitted] = useState(false);
  const [emptyError, setEmptyError] = useState(false);

  function onFile(index: number, file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setFiles((current) => {
      const next = [...current];
      if (next[index]) URL.revokeObjectURL(next[index] as string);
      next[index] = url;
      return next;
    });
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!files.some(Boolean)) {
      setEmptyError(true);
      return;
    }
    setEmptyError(false);
    setSubmitted(true);
  }

  return (
    <section className="fitme-section" style={{ paddingTop: "3rem" }}>
      <Container>
        <p className="fitme-eyebrow">Étape 01</p>
        <h1 className="fitme-display fitme-h2">Ajoutez vos photos</h1>
        <p className="fitme-lead">
          Quelques photos suffisent pour créer votre profil. Idéalement de face, en lumière
          naturelle, avec des vêtements simples.
        </p>

        {submitted ? (
          <div className="fitme-palette__card" style={{ marginTop: "2rem", maxWidth: 520 }}>
            <p className="fitme-palette__title">{PRODUCT.name}</p>
            <h2 className="fitme-display" style={{ fontSize: "1.8rem", marginTop: "0.7rem" }}>
              Vos photos sont prêtes.
            </h2>
            <p className="fitme-lead" style={{ marginTop: "0.7rem" }}>
              L’analyse personnalisée arrive avec le lancement. Votre Style Profile restera un achat
              unique, sans abonnement.
            </p>
            <div style={{ marginTop: "1.4rem" }}>
              <CtaButton href="/">Retour à l’accueil</CtaButton>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <div className="fitme-upload">
              {SLOTS.map((slot) => (
                <label key={slot} className="fitme-slot">
                  {files[slot] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={files[slot] ?? ""} alt="" />
                  ) : (
                    <span>
                      Photo {slot + 1}
                      <br />
                      Ajouter
                    </span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    aria-label={`Ajouter la photo ${slot + 1}`}
                    onChange={(event) => onFile(slot, event.target.files?.[0])}
                  />
                </label>
              ))}
            </div>
            <div style={{ marginTop: "1.5rem" }}>
              <button type="submit" className="fitme-cta">
                {CTA.primaryArrow}
              </button>
              {emptyError ? (
                <p className="fitme-fine" style={{ color: "#8a3a3a" }}>
                  Ajoutez au moins une photo pour continuer.
                </p>
              ) : (
                <p className="fitme-fine">{CTA.finePrint}</p>
              )}
            </div>
          </form>
        )}
      </Container>
    </section>
  );
}
