"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FitmeFlowShell } from "@/components/fitme-app/FitmeAppShell";
import { compressImageFile } from "@/components/fitme-app/compress-image";
import { IMAGES } from "@/components/fitme-landing/config";
import { trackFitmeEvent } from "@/src/lib/fitme/analytics";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_SOURCE_IMAGE_BYTES,
  PHOTO_SLOTS,
  STYLE_GOALS,
  STYLE_UNIVERSES,
} from "@/src/lib/fitme/constants";
import { createClient } from "@/src/lib/supabase/client";

type SlotKey = (typeof PHOTO_SLOTS)[number]["key"];
type SlotFile = { file: File; preview: string } | null;

const UNIVERSE_IMAGES: Record<string, string> = {
  "clean-minimal": IMAGES.cleanMinimal,
  "old-money": IMAGES.oldMoney,
  streetwear: IMAGES.streetwear,
  "smart-casual": IMAGES.smartCasual,
  relaxed: IMAGES.relaxed,
  workwear: IMAGES.workwear,
};

function isAccepted(file: File) {
  return (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type) && file.size <= MAX_SOURCE_IMAGE_BYTES;
}

export function OnboardingClient({
  firstName,
}: {
  firstName: string | null;
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [name, setName] = useState(firstName ?? "");
  const [presentation, setPresentation] = useState<"femme" | "homme" | "neutre" | "">("");
  const [files, setFiles] = useState<Record<SlotKey, SlotFile>>({
    portrait: null,
    full_body: null,
    extra: null,
    extra2: null,
  });
  const [universes, setUniverses] = useState<string[]>([]);
  const [goal, setGoal] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    trackFitmeEvent("onboarding_started");
    void fetch("/api/style/analyses", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" })
      .then((response) => response.json())
      .then((data: { analysisId?: string }) => {
        if (data.analysisId) setAnalysisId(data.analysisId);
      })
      .catch(() => setError("Impossible de préparer votre analyse."));
  }, []);

  const canPhotos = Boolean(files.portrait && files.full_body && files.extra);

  async function assignFile(key: SlotKey, file: File | undefined) {
    if (!file) return;
    if (!isAccepted(file)) {
      setError("Utilisez une image JPG, PNG ou WEBP de moins de 8 Mo.");
      return;
    }
    setError(null);
    const compressed = await compressImageFile(file);
    setFiles((current) => {
      if (current[key]?.preview) URL.revokeObjectURL(current[key]!.preview);
      return { ...current, [key]: { file: compressed, preview: URL.createObjectURL(compressed) } };
    });
  }

  function toggleUniverse(id: string) {
    if (id === "surprise") {
      setUniverses(["surprise"]);
      return;
    }
    setUniverses((current) => {
      const next = current.filter((item) => item !== "surprise");
      return next.includes(id) ? next.filter((item) => item !== id) : [...next, id];
    });
  }

  async function savePreferences(id: string) {
    await fetch(`/api/style/analyses/${id}/preferences`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: name.trim() || null,
        presentation: presentation || null,
        universes,
        goal: goal || null,
      }),
    });
  }

  async function uploadAndStart() {
    if (!analysisId) throw new Error("Analyse introuvable.");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Session expirée. Reconnectez-vous.");

    const payload: { type: "portrait" | "full_body" | "extra"; storagePath: string }[] = [];
    let extraIndex = 0;
    for (const slot of PHOTO_SLOTS) {
      const current = files[slot.key];
      if (!current) {
        if (slot.required) throw new Error("Ajoutez encore une photo.");
        continue;
      }
      extraIndex += slot.type === "extra" ? 1 : 0;
      const nameOnDisk =
        slot.type === "portrait"
          ? "original-1.jpg"
          : slot.type === "full_body"
            ? "original-2.jpg"
            : `original-${2 + extraIndex}.jpg`;
      const storagePath = `${user.id}/${analysisId}/${nameOnDisk}`;
      const { error: uploadError } = await supabase.storage.from("style-inputs").upload(storagePath, current.file, {
        upsert: true,
        contentType: current.file.type,
      });
      if (uploadError) throw new Error("L’envoi d’une photo a échoué.");
      payload.push({ type: slot.type, storagePath });
    }

    const confirm = await fetch(`/api/style/analyses/${analysisId}/images`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images: payload }),
    });
    if (!confirm.ok) {
      const data = (await confirm.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error ?? "Impossible d’enregistrer les photos.");
    }
    trackFitmeEvent("photos_uploaded");

    await savePreferences(analysisId);

    const started = await fetch(`/api/style/analyses/${analysisId}/start`, { method: "POST" });
    if (!started.ok) {
      const data = (await started.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error ?? "Impossible de lancer l’analyse.");
    }
    trackFitmeEvent("analysis_started");
    router.push(`/analysis/${analysisId}`);
  }

  const examples = useMemo(
    () => [
      { src: IMAGES.original, label: "Portrait net" },
      { src: IMAGES.smartCasual, label: "Plein pied" },
    ],
    [],
  );

  return (
    <FitmeFlowShell step={step}>
      {step === 1 ? (
        <>
          <p className="fitme-eyebrow">Étape 01</p>
          <h1>Commençons par vous.</h1>
          <p className="fitme-lead">Quelques informations nous permettent de personnaliser votre Style Profile.</p>
          <div className="fitme-field">
            <label htmlFor="first-name">Prénom (optionnel)</label>
            <input id="first-name" className="fitme-input" value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="fitme-field">
            <span>Présentation souhaitée</span>
            <div className="fitme-choice-grid">
              {(["femme", "homme", "neutre"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  className={presentation === value ? "fitme-choice is-on" : "fitme-choice"}
                  onClick={() => setPresentation(value)}
                >
                  <strong>{value === "neutre" ? "Peu importe" : value[0]!.toUpperCase() + value.slice(1)}</strong>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : null}

      {step === 2 ? (
        <>
          <p className="fitme-eyebrow">Étape 02</p>
          <h1>Ajoutez quelques photos de vous.</h1>
          <p className="fitme-lead">Un portrait, un plein pied, et une photo de plus. Lumière naturelle si possible.</p>
          <div className="fitme-photos">
            {PHOTO_SLOTS.map((slot) => (
              <label
                key={slot.key}
                className="fitme-photo-slot"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  void assignFile(slot.key, event.dataTransfer.files[0]);
                }}
              >
                {files[slot.key] ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={files[slot.key]!.preview} alt="" />
                    <button
                      type="button"
                      className="fitme-photo-slot__remove"
                      onClick={(event) => {
                        event.preventDefault();
                        if (files[slot.key]?.preview) URL.revokeObjectURL(files[slot.key]!.preview);
                        setFiles((current) => ({ ...current, [slot.key]: null }));
                      }}
                    >
                      Remplacer
                    </button>
                  </>
                ) : (
                  <div className="fitme-photo-slot__empty">
                    <strong>{slot.title}</strong>
                    <small>{slot.hint}</small>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  capture={slot.type === "portrait" ? "user" : undefined}
                  onChange={(event) => void assignFile(slot.key, event.target.files?.[0])}
                />
              </label>
            ))}
          </div>
          <ul className="fitme-tips">
            <li>Lumière naturelle si possible</li>
            <li>Visage visible, sans filtre lourd</li>
            <li>Photo récente, plein pied pour au moins une image</li>
          </ul>
          <div className="fitme-look-grid" style={{ marginTop: "1rem" }}>
            {examples.map((example) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={example.label} src={example.src} alt={example.label} />
            ))}
          </div>
        </>
      ) : null}

      {step === 3 ? (
        <>
          <p className="fitme-eyebrow">Étape 03</p>
          <h1>Qu’est-ce qui vous attire ?</h1>
          <p className="fitme-lead">Ces choix ne déterminent pas le résultat. Ils aident simplement à vous comprendre.</p>
          <div className="fitme-choice-grid">
            {STYLE_UNIVERSES.map((universe) => (
              <button
                key={universe.id}
                type="button"
                className={universes.includes(universe.id) ? "fitme-choice is-on" : "fitme-choice"}
                onClick={() => toggleUniverse(universe.id)}
              >
                <span className="fitme-universe">
                  {UNIVERSE_IMAGES[universe.id] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={UNIVERSE_IMAGES[universe.id]} alt="" />
                  ) : (
                    <span />
                  )}
                  <strong>{universe.name}</strong>
                </span>
              </button>
            ))}
          </div>
        </>
      ) : null}

      {step === 4 ? (
        <>
          <p className="fitme-eyebrow">Étape 04</p>
          <h1>Que recherchez-vous surtout ?</h1>
          <p className="fitme-lead">Une seule intention suffit. Ensuite, on lance votre analyse.</p>
          <div className="fitme-choice-grid">
            {STYLE_GOALS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={goal === item.id ? "fitme-choice is-on" : "fitme-choice"}
                onClick={() => setGoal(item.id)}
              >
                <strong>{item.label}</strong>
              </button>
            ))}
          </div>
        </>
      ) : null}

      {error ? <p className="fitme-error">{error}</p> : null}

      <div className="fitme-sticky-cta">
        {step > 1 ? (
          <button
            type="button"
            className="fitme-cta fitme-cta--ghost fitme-cta--block"
            style={{ marginBottom: "0.55rem" }}
            onClick={() => setStep((value) => value - 1)}
          >
            Retour
          </button>
        ) : null}
        <button
          type="button"
          className="fitme-cta fitme-cta--block"
          disabled={busy || (step === 2 && !canPhotos) || !analysisId}
          onClick={() => {
            if (step < 4) {
              if (step === 2 && !canPhotos) {
                setError("Ajoutez au moins un portrait, un plein pied et une photo supplémentaire.");
                return;
              }
              setError(null);
              setStep((value) => value + 1);
              return;
            }
            setBusy(true);
            void uploadAndStart()
              .catch((err: unknown) => {
                setError(err instanceof Error ? err.message : "Quelque chose n’a pas fonctionné.");
              })
              .finally(() => setBusy(false));
          }}
        >
          {busy ? "Envoi…" : step === 4 ? "Lancer mon analyse" : "Continuer"}
        </button>
      </div>
    </FitmeFlowShell>
  );
}
