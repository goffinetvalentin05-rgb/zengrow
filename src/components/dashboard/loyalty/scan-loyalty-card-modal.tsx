"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, Gift, SwitchCamera, X } from "lucide-react";
import { useDialogFocusTrap } from "@/src/components/dashboard/reservations/hooks/use-dialog-focus-trap";
import DashboardPortal from "@/src/components/dashboard/ui/dashboard-portal";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import { formatAmountInput, parseAmountInput } from "@/src/lib/gift-vouchers/money";
import { resolveScannedLoyaltyPayload } from "@/src/lib/loyalty/code";
import { calculatePurchasePoints, formatPoints } from "@/src/lib/loyalty/points";
import type { LoyaltyCardRecord, LoyaltyProgramSettings } from "@/src/lib/loyalty/types";
import { cn } from "@/src/lib/utils";

type ScanLoyaltyCardModalProps = {
  open: boolean;
  settings: LoyaltyProgramSettings;
  onClose: () => void;
  onUpdated?: (card: LoyaltyCardRecord) => void | Promise<void>;
};

type CameraErrorKind = "permission" | "unavailable" | "unsupported";
type ScanPhase = "camera" | "result" | "success";

function cameraError(error: unknown): { kind: CameraErrorKind; message: string } {
  const name = error instanceof DOMException ? error.name : "";
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return { kind: "permission", message: "Autorisez l’accès à la caméra pour scanner la carte." };
  }
  return { kind: "unavailable", message: "Impossible d’accéder à la caméra." };
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <dt className="text-sm text-white/60">{label}</dt>
      <dd className="max-w-[62%] text-right text-sm font-medium break-words text-white">{value}</dd>
    </div>
  );
}

export default function ScanLoyaltyCardModal({ open, settings, onClose, onUpdated }: ScanLoyaltyCardModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const detectingRef = useRef(false);
  const stoppedRef = useRef(true);
  const sessionRef = useRef(0);
  const lastInvalidAtRef = useRef(0);
  const lookupRawRef = useRef<(raw: string) => Promise<void>>(async () => undefined);
  const busyRef = useRef(false);

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorKind, setErrorKind] = useState<CameraErrorKind | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [phase, setPhase] = useState<ScanPhase>("camera");
  const [card, setCard] = useState<LoyaltyCardRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const [amount, setAmount] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [successKind, setSuccessKind] = useState<"purchase" | "reward" | null>(null);
  const [pointsAdded, setPointsAdded] = useState(0);
  const [seenOpen, setSeenOpen] = useState(open);
  if (seenOpen !== open) {
    setSeenOpen(open);
    if (!open) {
      setError(null);
      setErrorKind(null);
      setLookingUp(false);
      setBusy(false);
      setPhase("camera");
      setCard(null);
      setAmount("");
      setManualCode("");
      setSuccessKind(null);
      setPointsAdded(0);
    }
  }

  useDialogFocusTrap(open, panelRef);

  const stopCamera = useCallback(() => {
    sessionRef.current += 1;
    stoppedRef.current = true;
    detectingRef.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    const video = videoRef.current;
    if (video) video.srcObject = null;
  }, []);

  const locked = lookingUp || busy;

  const handleClose = useCallback(() => {
    if (locked) return;
    stopCamera();
    onClose();
  }, [locked, onClose, stopCamera]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !locked) handleClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, handleClose, locked]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const lookupRaw = useCallback(async (raw: string) => {
    setLookingUp(true);
    setError(null);
    try {
      const response = await fetch("/api/loyalty/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw }),
      });
      const payload = (await response.json().catch(() => null)) as { card?: LoyaltyCardRecord; error?: string } | null;
      if (!response.ok || !payload?.card) {
        setError(payload?.error ?? "Cette carte n’existe pas.");
        setErrorKind(response.status >= 500 ? "unavailable" : null);
        setPhase("camera");
        return;
      }
      setCard(payload.card);
      setAmount("");
      setSuccessKind(null);
      setPhase("result");
    } catch {
      setError("Impossible de rechercher cette carte. Vérifiez votre connexion.");
      setErrorKind("unavailable");
      setPhase("camera");
    } finally {
      setLookingUp(false);
    }
  }, []);

  useEffect(() => {
    lookupRawRef.current = lookupRaw;
  }, [lookupRaw]);

  const onDecoded = useCallback(
    async (raw: string) => {
      if (detectingRef.current || stoppedRef.current) return;
      if (!resolveScannedLoyaltyPayload(raw)) {
        const now = Date.now();
        if (now - lastInvalidAtRef.current > 1600) {
          lastInvalidAtRef.current = now;
          setError("Ce QR code n’est pas une carte ZenGrow valide.");
        }
        return;
      }
      detectingRef.current = true;
      stopCamera();
      await lookupRawRef.current(raw);
    },
    [stopCamera],
  );

  const onDecodedRef = useRef(onDecoded);
  useEffect(() => {
    onDecodedRef.current = onDecoded;
  }, [onDecoded]);

  const startCamera = useCallback(
    async (preferredDeviceId?: string | null) => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setErrorKind("unsupported");
        setError("Impossible d’accéder à la caméra.");
        return;
      }

      stopCamera();
      const session = sessionRef.current;
      stoppedRef.current = false;
      detectingRef.current = false;
      setError(null);
      setErrorKind(null);
      setPhase("camera");
      setCard(null);
      setAmount("");
      setSuccessKind(null);

      try {
        const constraints: MediaStreamConstraints = {
          audio: false,
          video: preferredDeviceId
            ? { deviceId: { exact: preferredDeviceId } }
            : { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        video.srcObject = stream;
        video.setAttribute("playsinline", "true");
        video.muted = true;
        await video.play();

        const listed = await navigator.mediaDevices.enumerateDevices();
        const cams = listed.filter((device) => device.kind === "videoinput");
        setDevices(cams);
        const currentId = stream.getVideoTracks()[0]?.getSettings().deviceId ?? preferredDeviceId ?? null;
        setDeviceId(currentId);

        const BarcodeDetectorCtor = (
          window as unknown as {
            BarcodeDetector?: new (opts: { formats: string[] }) => {
              detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue?: string }>>;
            };
          }
        ).BarcodeDetector;

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d", { willReadFrequently: true });
        let detector: { detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue?: string }>> } | null = null;
        try {
          if (BarcodeDetectorCtor) detector = new BarcodeDetectorCtor({ formats: ["qr_code"] });
        } catch {
          detector = null;
        }
        const jsQR = detector ? null : (await import("jsqr")).default;

        const tick = async () => {
          if (stoppedRef.current || session !== sessionRef.current) return;
          const el = videoRef.current;
          if (el && el.readyState >= 2) {
            try {
              let value: string | null = null;
              if (detector) {
                const codes = await detector.detect(el);
                value = codes[0]?.rawValue ?? null;
              } else if (jsQR && context && el.videoWidth > 0) {
                canvas.width = el.videoWidth;
                canvas.height = el.videoHeight;
                context.drawImage(el, 0, 0);
                const image = context.getImageData(0, 0, canvas.width, canvas.height);
                const result = jsQR(image.data, image.width, image.height, { inversionAttempts: "dontInvert" });
                value = result?.data ?? null;
              }
              if (value) {
                await onDecodedRef.current(value);
                return;
              }
            } catch {
              // frame skip
            }
          }
          rafRef.current = requestAnimationFrame(() => {
            void tick();
          });
        };

        rafRef.current = requestAnimationFrame(() => {
          void tick();
        });
      } catch (caught) {
        const mapped = cameraError(caught);
        setErrorKind(mapped.kind);
        setError(mapped.message);
        stopCamera();
      }
    },
    [stopCamera],
  );

  useEffect(() => {
    if (!open) {
      stopCamera();
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (!cancelled) void startCamera(null);
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      stopCamera();
    };
  }, [open, startCamera, stopCamera]);

  function switchCamera() {
    if (devices.length < 2) return;
    const currentIndex = devices.findIndex((device) => device.deviceId === deviceId);
    const next = devices[(currentIndex + 1) % devices.length];
    if (next) void startCamera(next.deviceId);
  }

  const parsedAmount = parseAmountInput(amount);
  const previewPoints =
    parsedAmount != null
      ? calculatePurchasePoints(Math.round(parsedAmount * 100), settings.spendAmountCents, settings.pointsPerSpend)
      : null;

  async function addPoints() {
    if (!card || busyRef.current || parsedAmount == null) return;
    busyRef.current = true;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/loyalty/cards/${card.id}/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parsedAmount }),
      });
      const payload = (await response.json().catch(() => null)) as {
        card?: LoyaltyCardRecord;
        pointsAdded?: number;
        error?: string;
      } | null;
      if (!response.ok || !payload?.card) {
        setError(payload?.error ?? "Impossible d’ajouter les points.");
        return;
      }
      setCard(payload.card);
      setPointsAdded(payload.pointsAdded ?? previewPoints ?? 0);
      setSuccessKind("purchase");
      setPhase("success");
      await onUpdated?.(payload.card);
    } catch {
      setError("Impossible d’ajouter les points. Vérifiez votre connexion.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  async function useReward(rewardId: string) {
    if (!card || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/loyalty/cards/${card.id}/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId }),
      });
      const payload = (await response.json().catch(() => null)) as { card?: LoyaltyCardRecord; error?: string } | null;
      if (!response.ok || !payload?.card) {
        setError(payload?.error ?? "Impossible d’utiliser cette récompense.");
        return;
      }
      setCard(payload.card);
      setSuccessKind("reward");
      setPhase("success");
      await onUpdated?.(payload.card);
    } catch {
      setError("Impossible d’utiliser cette récompense. Vérifiez votre connexion.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  async function submitManualCode(event: React.FormEvent) {
    event.preventDefault();
    if (!manualCode.trim() || lookingUp) return;
    stopCamera();
    await lookupRaw(manualCode);
  }

  if (!open) return null;

  const showCamera = phase === "camera";
  const bestReward = card?.rewardState.bestAvailable ?? null;
  const title =
    phase === "success"
      ? successKind === "reward"
        ? "Récompense utilisée"
        : "Points ajoutés"
      : phase === "result"
        ? card?.customerName ?? "Carte reconnue"
        : "Scanner une carte";
  const subtitle =
    phase === "camera"
      ? "Placez le QR code de la carte dans le cadre"
      : phase === "success"
        ? successKind === "reward"
          ? "La récompense a été enregistrée."
          : "Le solde et la dernière visite ont été mis à jour."
        : "Ajoutez un achat ou utilisez une récompense.";

  return (
    <DashboardPortal>
      <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black sm:items-center sm:p-4" role="presentation">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="scan-loyalty-card-title"
          className={cn(
            "relative flex h-[100dvh] w-full max-w-lg flex-col overflow-hidden bg-black text-white",
            "sm:h-[min(92dvh,760px)] sm:rounded-3xl",
          )}
        >
          <header className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-4 pt-[max(1rem,env(safe-area-inset-top))]">
            <div>
              <h2 id="scan-loyalty-card-title" className="text-lg font-semibold">
                {title}
              </h2>
              <p className="mt-1 text-sm text-white/75">{subtitle}</p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              disabled={locked}
              className="rounded-full bg-white/15 p-2.5 text-white hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:opacity-50"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </header>

          <div className="relative min-h-0 flex-1">
            {showCamera ? (
              <>
                <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" playsInline muted autoPlay />
                <div className="absolute inset-0 bg-black/25" />
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="relative aspect-square w-full max-w-[min(82vw,22rem)] rounded-[1.75rem] border-[3px] border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
                </div>
                {lookingUp ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/55">
                    <p className="text-base font-medium">Identification de la carte…</p>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="absolute inset-0 overflow-y-auto px-5 pb-4 pt-24">
                {phase === "success" && card ? (
                  <div className="rounded-3xl border border-emerald-400/30 bg-white/10 px-5 py-6">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-8 w-8 shrink-0 text-emerald-300" strokeWidth={2} aria-hidden />
                      <div>
                        <p className="text-lg font-semibold">
                          {successKind === "reward" ? "Récompense utilisée" : "Points ajoutés"}
                        </p>
                        <p className="mt-1 text-sm text-white/80">
                          {successKind === "purchase" ? `+${pointsAdded} points` : card.customerName}
                        </p>
                      </div>
                    </div>
                    <dl className="mt-5 divide-y divide-white/10">
                      <Row label="Client" value={card.customerName} />
                      <Row label="Nouveau solde" value={formatPoints(card.pointsBalance)} />
                    </dl>
                  </div>
                ) : null}

                {card && phase === "result" ? (
                  <div className="space-y-4">
                    <div className="rounded-3xl border border-white/15 bg-white/10 px-5 py-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-white/55">Client</p>
                      <h3 className="mt-1 text-2xl font-semibold">{card.customerName}</h3>
                      <p className="mt-1 text-lg font-medium tabular-nums text-white/90">{formatPoints(card.pointsBalance)}</p>
                      <p className="mt-1 font-mono text-xs tracking-wide text-white/55">{card.cardCode}</p>
                    </div>

                    {bestReward ? (
                      <div className="rounded-3xl border border-amber-300/30 bg-amber-300/10 px-5 py-5">
                        <p className="flex items-center gap-2 text-sm font-semibold">
                          <Gift className="h-4 w-4" strokeWidth={2} aria-hidden />
                          Récompense disponible
                        </p>
                        <p className="mt-2 text-xl font-semibold">{bestReward.title}</p>
                        <p className="mt-1 text-sm text-white/70">{formatPoints(bestReward.pointsRequired)}</p>
                        <Button
                          type="button"
                          size="lg"
                          className="mt-4 min-h-12 w-full text-base"
                          disabled={busy}
                          onClick={() => void useReward(bestReward.id)}
                        >
                          Utiliser la récompense
                        </Button>
                      </div>
                    ) : null}

                    <div className="rounded-3xl border border-white/15 bg-white/10 px-5 py-5">
                      <p className="text-sm font-semibold">Ajouter un achat</p>
                      <label htmlFor="loyalty-purchase-amount" className="mt-3 block text-sm text-white/70">
                        Montant de l’achat
                      </label>
                      <div className="relative mt-2">
                        <Input
                          id="loyalty-purchase-amount"
                          value={amount}
                          onChange={(event) => {
                            setAmount(event.target.value);
                            setError(null);
                          }}
                          placeholder="62.00"
                          inputMode="decimal"
                          autoComplete="off"
                          className="min-h-14 border-white/25 bg-white/10 pr-16 text-lg tabular-nums text-white placeholder:text-white/35 hover:border-white/40 focus:border-white/60 focus:ring-white/25 focus:shadow-none"
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              void addPoints();
                            }
                          }}
                        />
                        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-semibold text-white/60">
                          CHF
                        </span>
                      </div>
                      {previewPoints != null ? (
                        <p className="mt-3 text-sm font-medium text-emerald-200">
                          +{previewPoints} points seront ajoutés
                        </p>
                      ) : (
                        <p className="mt-3 text-sm text-white/55">
                          {formatAmountInput(settings.spendAmountCents / 100)} CHF = {settings.pointsPerSpend} point
                          {settings.pointsPerSpend > 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <footer className="relative z-10 space-y-3 bg-gradient-to-t from-black via-black/90 to-transparent px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6">
            {error ? <p className="text-center text-sm font-medium text-red-200">{error}</p> : null}

            {showCamera ? (
              <div className="flex flex-col gap-2">
                <form onSubmit={submitManualCode} className="flex gap-2">
                  <Input
                    value={manualCode}
                    onChange={(event) => setManualCode(event.target.value)}
                    placeholder="Saisir le code de la carte"
                    className="min-h-12 border-white/25 bg-white/10 text-white placeholder:text-white/40 hover:border-white/40 focus:border-white/60 focus:ring-white/25 focus:shadow-none"
                  />
                  <Button type="submit" variant="secondary" className="min-h-12 shrink-0" disabled={lookingUp}>
                    OK
                  </Button>
                </form>
                {errorKind || error ? (
                  <Button type="button" size="lg" className="min-h-12 w-full text-base" disabled={locked} onClick={() => void startCamera(deviceId)}>
                    <Camera className="h-5 w-5" strokeWidth={2} aria-hidden />
                    Réessayer
                  </Button>
                ) : null}
                {devices.length > 1 ? (
                  <button
                    type="button"
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 text-base font-semibold text-white hover:bg-white/15 disabled:opacity-50"
                    disabled={locked}
                    onClick={switchCamera}
                  >
                    <SwitchCamera className="h-5 w-5" strokeWidth={2} aria-hidden />
                    Changer de caméra
                  </button>
                ) : null}
              </div>
            ) : null}

            {phase === "result" && card ? (
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  size="lg"
                  className="min-h-12 w-full text-base"
                  disabled={busy || parsedAmount == null}
                  onClick={() => void addPoints()}
                >
                  {busy ? "Ajout…" : "Ajouter les points"}
                </Button>
                <button
                  type="button"
                  className="flex min-h-12 w-full items-center justify-center rounded-xl border border-white/25 bg-white/10 text-base font-semibold text-white hover:bg-white/15"
                  onClick={() => void startCamera(deviceId)}
                >
                  Scanner une autre carte
                </button>
              </div>
            ) : null}

            {phase === "success" ? (
              <div className="flex flex-col gap-2">
                <Button type="button" size="lg" className="min-h-12 w-full text-base" onClick={handleClose}>
                  Terminer
                </Button>
                <button
                  type="button"
                  className="flex min-h-12 w-full items-center justify-center rounded-xl border border-white/25 bg-white/10 text-base font-semibold text-white hover:bg-white/15"
                  onClick={() => void startCamera(deviceId)}
                >
                  Scanner une autre carte
                </button>
              </div>
            ) : null}
          </footer>
        </div>
      </div>
    </DashboardPortal>
  );
}
