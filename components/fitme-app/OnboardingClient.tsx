"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FitmeFlowShell } from "@/components/fitme-app/FitmeAppShell";
import { FitmeErrorState } from "@/components/fitme-app/FitmeErrorState";
import { compressImageFile } from "@/components/fitme-app/compress-image";
import { IMAGES } from "@/components/fitme-landing/config";
import { apiJson } from "@/src/lib/fitme/client-api";
import { trackFitmeEvent } from "@/src/lib/fitme/analytics";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_SOURCE_IMAGE_BYTES,
  PHOTO_SLOTS,
  STYLE_GOALS,
  STYLE_UNIVERSES,
  SURPRISE_UNIVERSE,
  sourceStoragePath,
} from "@/src/lib/fitme/constants";
import { createClient } from "@/src/lib/supabase/client";

type SlotKey = (typeof PHOTO_SLOTS)[number]["key"];
type Screen = "photos" | "universes" | "goals" | "recap";
type SlotState = {
  file: File | null;
  preview: string | null;
  uploading: boolean;
  uploaded: boolean;
  storagePath: string | null;
};

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

function emptySlots(): Record<SlotKey, SlotState> {
  return {
    portrait: { file: null, preview: null, uploading: false, uploaded: false, storagePath: null },
    full_body: { file: null, preview: null, uploading: false, uploaded: false, storagePath: null },
    extra: { file: null, preview: null, uploading: false, uploaded: false, storagePath: null },
    extra2: { file: null, preview: null, uploading: false, uploaded: false, storagePath: null },
  };
}

const SCREEN_STEP: Record<Screen, number> = {
  photos: 1,
  universes: 2,
  goals: 2,
  recap: 3,
};

export function OnboardingClient({ firstName }: { firstName: string | null }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [screen, setScreen] = useState<Screen>("photos");
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [name, setName] = useState(firstName ?? "");
  const [files, setFiles] = useState<Record<SlotKey, SlotState>>(emptySlots);
  const [universes, setUniverses] = useState<string[]>([]);
  const [goal, setGoal] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    trackFitmeEvent("onboarding_started");
    void apiJson<{ analysisId: string }>("/api/style-analysis/create", {
      method: "POST",
      body: "{}",
    })
      .then(async (data) => {
        setAnalysisId(data.analysisId);
        const status = await apiJson<{
          analysis?: { photos?: { type: string; url: string; storagePath: string }[] };
        }>(`/api/style-analysis/${data.analysisId}/status`);
        const photos = status.analysis?.photos ?? [];
        if (!photos.length) return;
        setFiles((current) => {
          const next = { ...current };
          const extras = photos.filter((photo) => photo.type === "extra");
          for (const slot of PHOTO_SLOTS) {
            const match =
              slot.type === "extra"
                ? extras[slot.key === "extra2" ? 1 : 0]
                : photos.find((photo) => photo.type === slot.type);
            if (match) {
              next[slot.key] = {
                file: null,
                preview: match.url,
                uploading: false,
                uploaded: true,
                storagePath: match.storagePath,
              };
            }
          }
          return next;
        });
      })
      .catch(() => setError("Impossible de préparer votre analyse."));
  }, []);

  const canPhotos = Boolean(
    (files.portrait.preview || files.portrait.file) &&
      (files.full_body.preview || files.full_body.file) &&
      (files.extra.preview || files.extra.file),
  );

  async function persistPhotos(id: string, nextFiles: Record<SlotKey, SlotState>) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSessionExpired(true);
      throw new Error("Session expirée.");
    }

    const payload: { type: "portrait" | "full_body" | "extra"; storagePath: string }[] = [];
    for (const slot of PHOTO_SLOTS) {
      const current = nextFiles[slot.key];
      if (!current.file && !current.uploaded) continue;
      const storagePath = current.file
        ? sourceStoragePath(user.id, id, slot.fileStem)
        : current.storagePath ?? sourceStoragePath(user.id, id, slot.fileStem);
      if (current.file) {
        const { error: uploadError } = await supabase.storage.from("style-inputs").upload(storagePath, current.file, {
          upsert: true,
          contentType: current.file.type || "image/jpeg",
        });
        if (uploadError) throw new Error("L’envoi d’une photo a échoué.");
      }
      payload.push({ type: slot.type, storagePath });
    }

    if (payload.length < 2) return;
    const hasPortrait = payload.some((image) => image.type === "portrait");
    const hasFullBody = payload.some((image) => image.type === "full_body");
    if (!hasPortrait || !hasFullBody) return;
    await apiJson(`/api/style-analysis/${id}/photos`, {
      method: "POST",
      body: JSON.stringify({ images: payload }),
    });
    trackFitmeEvent("photos_uploaded");
  }

  async function assignFile(key: SlotKey, file: File | undefined) {
    if (!file) return;
    if (!isAccepted(file)) {
      setError("Utilisez une image JPG, PNG ou WEBP de moins de 8 Mo.");
      return;
    }
    setError(null);
    setFiles((current) => ({ ...current, [key]: { ...current[key], uploading: true } }));
    try {
      const compressed = await compressImageFile(file);
      const preview = URL.createObjectURL(compressed);
      const next = {
        ...files,
        [key]: { file: compressed, preview, uploading: false, uploaded: false, storagePath: null },
      };
      setFiles(next);
      if (analysisId) {
        setFiles((current) => ({ ...current, [key]: { ...current[key], uploading: true } }));
        await persistPhotos(analysisId, next);
        setFiles((current) => ({
          ...current,
          [key]: {
            file: compressed,
            preview,
            uploading: false,
            uploaded: true,
            storagePath: current[key].storagePath,
          },
        }));
      }
    } catch (err) {
      setFiles((current) => ({ ...current, [key]: { ...current[key], uploading: false } }));
      setError(err instanceof Error ? err.message : "L’envoi d’une photo a échoué.");
    }
  }

  function clearSlot(key: SlotKey) {
    setFiles((current) => {
      if (current[key].preview?.startsWith("blob:")) URL.revokeObjectURL(current[key].preview!);
      return { ...current, [key]: { file: null, preview: null, uploading: false, uploaded: false, storagePath: null } };
    });
  }

  function toggleUniverse(id: string) {
    if (id === SURPRISE_UNIVERSE.id) {
      setUniverses([SURPRISE_UNIVERSE.id]);
      return;
    }
    setUniverses((current) => {
      const next = current.filter((item) => item !== SURPRISE_UNIVERSE.id);
      if (next.includes(id)) return next.filter((item) => item !== id);
      if (next.length >= 3) return next;
      return [...next, id];
    });
  }

  async function submit() {
    if (!analysisId) throw new Error("Analyse introuvable.");
    await persistPhotos(analysisId, files);
    await apiJson(`/api/style-analysis/${analysisId}/preferences`, {
      method: "PATCH",
      body: JSON.stringify({
        firstName: name.trim() || null,
        universes,
        goal: goal || null,
      }),
    });
    await apiJson("/api/style-analysis/start", {
      method: "POST",
      body: JSON.stringify({ analysisId }),
    });
    trackFitmeEvent("analysis_started");
    router.push(`/analysis/${analysisId}`);
  }

  const selectedUniverseNames = useMemo(() => {
    if (universes.includes(SURPRISE_UNIVERSE.id) || universes.length === 0) {
      return [SURPRISE_UNIVERSE.name];
    }
    return STYLE_UNIVERSES.filter((item) => universes.includes(item.id)).map((item) => item.name);
  }, [universes]);

  const goalLabel = STYLE_GOALS.find((item) => item.id === goal)?.label ?? "À découvrir";

  if (sessionExpired) {
    return (
      <FitmeFlowShell step={1}>
        <FitmeErrorState
          title="Session expirée."
          message="Reconnectez-vous pour continuer votre Style Profile."
          actionLabel="Se connecter"
          href="/login?next=/onboarding"
        />
      </FitmeFlowShell>
    );
  }

  const variants = reduce
    ? undefined
    : {
        initial: { opacity: 0, x: 28 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -18 },
      };

  return (
    <FitmeFlowShell step={SCREEN_STEP[screen]}>
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={variants?.initial}
          animate={variants?.animate ?? { opacity: 1 }}
          exit={variants?.exit}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        >
          {screen === "photos" ? (
            <>
              <p className="fitme-eyebrow">01 Photos</p>
              <h1>Montrez-nous simplement qui vous êtes.</h1>
              <p className="fitme-lead">Quelques photos suffisent pour construire votre Style Profile.</p>
              <div className="fitme-photos">
                {PHOTO_SLOTS.map((slot) => {
                  const current = files[slot.key];
                  return (
                    <label
                      key={slot.key}
                      className={`fitme-photo-slot ${current.uploaded ? "is-ready" : ""} ${current.uploading ? "is-busy" : ""}`}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        void assignFile(slot.key, event.dataTransfer.files[0]);
                      }}
                    >
                      {current.preview ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={current.preview} alt="" />
                          <span className="fitme-photo-slot__badge">
                            {current.uploading ? "Envoi…" : current.uploaded ? "Ajoutée" : "Prête"}
                          </span>
                          <button
                            type="button"
                            className="fitme-photo-slot__remove"
                            onClick={(event) => {
                              event.preventDefault();
                              clearSlot(slot.key);
                            }}
                          >
                            Supprimer
                          </button>
                        </>
                      ) : (
                        <div className="fitme-photo-slot__empty">
                          <strong>{slot.title}</strong>
                          <small>{slot.hint}</small>
                          <em>{slot.required ? "Galerie ou appareil" : "Optionnelle"}</em>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        capture={slot.type === "portrait" ? "user" : undefined}
                        onChange={(event) => void assignFile(slot.key, event.target.files?.[0])}
                      />
                    </label>
                  );
                })}
              </div>
              <ul className="fitme-tips">
                <li>Lumière naturelle</li>
                <li>Visage visible</li>
                <li>Pas de filtre lourd</li>
                <li>Tenue normale</li>
                <li>Au moins une photo plein pied</li>
              </ul>
            </>
          ) : null}

          {screen === "universes" ? (
            <>
              <p className="fitme-eyebrow">02 Préférences</p>
              <h1>Quels univers vous attirent ?</h1>
              <p className="fitme-lead">Jusqu’à trois choix. Ils aident à vous comprendre, sans imposer le résultat.</p>
              <div className="fitme-universe-grid">
                {STYLE_UNIVERSES.map((universe) => (
                  <button
                    key={universe.id}
                    type="button"
                    className={universes.includes(universe.id) ? "fitme-universe-card is-on" : "fitme-universe-card"}
                    onClick={() => toggleUniverse(universe.id)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={UNIVERSE_IMAGES[universe.id]} alt="" />
                    <strong>{universe.name}</strong>
                  </button>
                ))}
              </div>
              <button
                type="button"
                className={universes.includes(SURPRISE_UNIVERSE.id) ? "fitme-choice is-on" : "fitme-choice"}
                style={{ marginTop: "0.9rem" }}
                onClick={() => toggleUniverse(SURPRISE_UNIVERSE.id)}
              >
                <strong>{SURPRISE_UNIVERSE.name}</strong>
              </button>
            </>
          ) : null}

          {screen === "goals" ? (
            <>
              <p className="fitme-eyebrow">02 Préférences</p>
              <h1>Qu’est-ce que vous cherchez surtout ?</h1>
              <p className="fitme-lead">Une seule intention suffit.</p>
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

          {screen === "recap" ? (
            <>
              <p className="fitme-eyebrow">03 Vérification</p>
              <h1>Prêt pour votre analyse.</h1>
              <p className="fitme-lead">Vérifiez vos photos et vos préférences, puis lancez votre Style Profile.</p>
              <div className="fitme-recap-photos">
                {PHOTO_SLOTS.filter((slot) => files[slot.key].preview).map((slot) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={slot.key} src={files[slot.key].preview!} alt={slot.title} />
                ))}
              </div>
              <article className="fitme-account-card">
                <p className="fitme-eyebrow">Univers</p>
                <p>{selectedUniverseNames.join(" · ")}</p>
                <p className="fitme-eyebrow" style={{ marginTop: "1rem" }}>
                  Intention
                </p>
                <p>{goalLabel}</p>
                <div className="fitme-field" style={{ marginTop: "1rem" }}>
                  <label htmlFor="recap-name">Prénom (optionnel)</label>
                  <input id="recap-name" className="fitme-input" value={name} onChange={(event) => setName(event.target.value)} />
                </div>
                <button type="button" className="fitme-cta fitme-cta--ghost" style={{ marginTop: "1rem" }} onClick={() => setScreen("photos")}>
                  Modifier
                </button>
              </article>
            </>
          ) : null}
        </motion.div>
      </AnimatePresence>

      {error ? <p className="fitme-error">{error}</p> : null}

      <div className="fitme-sticky-cta">
        {screen !== "photos" ? (
          <button
            type="button"
            className="fitme-cta fitme-cta--ghost fitme-cta--block"
            style={{ marginBottom: "0.55rem" }}
            onClick={() => {
              if (screen === "universes") setScreen("photos");
              if (screen === "goals") setScreen("universes");
              if (screen === "recap") setScreen("goals");
            }}
          >
            Retour
          </button>
        ) : null}
        <button
          type="button"
          className="fitme-cta fitme-cta--block"
          disabled={busy || (screen === "photos" && !canPhotos) || !analysisId}
          onClick={() => {
            if (screen === "photos") {
              if (!canPhotos) {
                setError("Ajoutez un portrait, un plein pied et une photo supplémentaire.");
                return;
              }
              setError(null);
              setScreen("universes");
              return;
            }
            if (screen === "universes") {
              setScreen("goals");
              return;
            }
            if (screen === "goals") {
              setScreen("recap");
              return;
            }
            setBusy(true);
            void submit()
              .catch((err: unknown) => {
                setError(err instanceof Error ? err.message : "Quelque chose n’a pas fonctionné.");
              })
              .finally(() => setBusy(false));
          }}
        >
          {busy ? "Création…" : screen === "recap" ? "Créer mon Style Profile" : "Continuer"}
        </button>
      </div>
    </FitmeFlowShell>
  );
}
