"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, SwitchCamera, X } from "lucide-react";
import { useDialogFocusTrap } from "@/src/components/dashboard/reservations/hooks/use-dialog-focus-trap";
import DashboardPortal from "@/src/components/dashboard/ui/dashboard-portal";
import Button from "@/src/components/ui/button";
import type { GiftCardRecord } from "@/src/components/dashboard/gift-cards/types";
import { formatChf } from "@/src/lib/gift-vouchers/money";
import { resolveScannedGiftVoucherPayload } from "@/src/lib/gift-vouchers/public-token";
import { getRedeemBlockReason, scannerVoucherMessage } from "@/src/lib/gift-vouchers/redeem";
import { cn } from "@/src/lib/utils";

type ScanGiftVoucherModalProps = {
  open: boolean;
  onClose: () => void;
  onRedeemed?: (voucher: GiftCardRecord) => void | Promise<void>;
};

type CameraErrorKind = "permission" | "unavailable" | "unsupported";
type ScanPhase = "camera" | "result" | "confirm" | "success";

type LookupPayload = {
  voucher?: GiftCardRecord;
  redeemable?: boolean;
  error?: string;
};

function scannerLookupError(status: number, payload: LookupPayload | null): string {
  if (status === 404) return "Ce bon n’existe pas.";
  if (payload?.error?.trim()) {
    if (/est expiré/i.test(payload.error)) return "Ce bon a expiré.";
    return payload.error;
  }
  if (status >= 500 || status === 0) return "Impossible de rechercher ce bon. Vérifiez votre connexion.";
  return "Ce bon n’existe pas.";
}

function scannerRedeemError(message: string): string {
  if (/est expiré/i.test(message)) return "Ce bon a expiré.";
  return message;
}

function cameraError(error: unknown): { kind: CameraErrorKind; message: string } {
  const name = error instanceof DOMException ? error.name : "";
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return {
      kind: "permission",
      message: "Autorisez l’accès à la caméra pour scanner le bon.",
    };
  }
  return {
    kind: "unavailable",
    message: "Impossible d’accéder à la caméra.",
  };
}

function voucherStatusLabel(voucher: GiftCardRecord): { label: string; tone: string } {
  const block = getRedeemBlockReason({
    status: voucher.status,
    remainingAmountCents: Math.round(voucher.balanceChf * 100),
    expiresAt: voucher.expiresAt ?? null,
  });
  if (block === "used") return { label: "Déjà utilisé", tone: "text-amber-200" };
  if (block === "expired") return { label: "Expiré", tone: "text-red-200" };
  if (block) return { label: scannerVoucherMessage(block), tone: "text-red-200" };
  return { label: "Valide", tone: "text-emerald-300" };
}

function usedAtLabel(voucher: GiftCardRecord): string | null {
  if (voucher.fullyUsedLabel && voucher.fullyUsedLabel !== "—") return voucher.fullyUsedLabel;
  const redemption = voucher.usageHistory.find((event) => event.kind === "redemption");
  return redemption?.dateLabel ?? null;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <dt className="text-sm text-white/60">{label}</dt>
      <dd className="max-w-[62%] text-right text-sm font-medium break-words text-white">{value}</dd>
    </div>
  );
}

export default function ScanGiftVoucherModal({ open, onClose, onRedeemed }: ScanGiftVoucherModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const detectingRef = useRef(false);
  const stoppedRef = useRef(true);
  const sessionRef = useRef(0);
  const lastInvalidAtRef = useRef(0);
  const lookupRawRef = useRef<(raw: string) => Promise<void>>(async () => undefined);
  const validatingRef = useRef(false);

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorKind, setErrorKind] = useState<CameraErrorKind | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [phase, setPhase] = useState<ScanPhase>("camera");
  const [voucher, setVoucher] = useState<GiftCardRecord | null>(null);
  const [validating, setValidating] = useState(false);

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

  const busy = lookingUp || validating;

  const handleClose = useCallback(() => {
    if (busy) return;
    stopCamera();
    onClose();
  }, [busy, onClose, stopCamera]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) handleClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, handleClose, busy]);

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
      const response = await fetch("/api/gift-vouchers/lookup-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw }),
      });
      const payload = (await response.json().catch(() => null)) as LookupPayload | null;
      if (!response.ok || !payload?.voucher) {
        setError(scannerLookupError(response.status, payload));
        setErrorKind(response.status >= 500 ? "unavailable" : null);
        setPhase("camera");
        return;
      }
      setVoucher(payload.voucher);
      setPhase("result");
    } catch {
      setError("Impossible de rechercher ce bon. Vérifiez votre connexion.");
      setErrorKind("unavailable");
      setPhase("camera");
    } finally {
      setLookingUp(false);
    }
  }, []);

  lookupRawRef.current = lookupRaw;

  const onDecoded = useCallback(
    async (raw: string) => {
      if (detectingRef.current || stoppedRef.current) return;
      if (!resolveScannedGiftVoucherPayload(raw)) {
        const now = Date.now();
        if (now - lastInvalidAtRef.current > 1600) {
          lastInvalidAtRef.current = now;
          setError("Ce QR code n’est pas un bon ZenGrow valide.");
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
  onDecodedRef.current = onDecoded;

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
      setVoucher(null);

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
          if (BarcodeDetectorCtor) {
            detector = new BarcodeDetectorCtor({ formats: ["qr_code"] });
          }
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
      setError(null);
      setErrorKind(null);
      setLookingUp(false);
      setValidating(false);
      setPhase("camera");
      setVoucher(null);
      validatingRef.current = false;
      return;
    }
    void startCamera(null);
    return () => stopCamera();
  }, [open, startCamera, stopCamera]);

  function switchCamera() {
    if (devices.length < 2) return;
    const currentIndex = devices.findIndex((device) => device.deviceId === deviceId);
    const next = devices[(currentIndex + 1) % devices.length];
    if (next) void startCamera(next.deviceId);
  }

  async function validateVoucher() {
    if (!voucher || validatingRef.current) return;
    validatingRef.current = true;
    setValidating(true);
    setError(null);
    try {
      const response = await fetch("/api/gift-vouchers/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voucherId: voucher.id, consumeAll: true }),
      });
      const payload = (await response.json().catch(() => null)) as {
        voucher?: GiftCardRecord;
        error?: string;
      } | null;
      if (!response.ok || !payload?.voucher) {
        const message = scannerRedeemError(payload?.error ?? "Impossible de valider ce bon.");
        if (/déjà été utilisé/i.test(message)) {
          setVoucher((prev) => (prev ? { ...prev, status: "used", balanceChf: 0 } : prev));
          setPhase("result");
          setError("Ce bon a déjà été utilisé.");
          return;
        }
        if (/a expiré/i.test(message)) {
          setPhase("result");
          setError("Ce bon a expiré.");
          return;
        }
        setError(message);
        setPhase("result");
        return;
      }
      setVoucher(payload.voucher);
      setPhase("success");
      await onRedeemed?.(payload.voucher);
    } catch {
      setError("Impossible de valider ce bon. Vérifiez votre connexion.");
      setPhase("result");
    } finally {
      validatingRef.current = false;
      setValidating(false);
    }
  }

  if (!open) return null;

  const status = voucher ? voucherStatusLabel(voucher) : null;
  const block = voucher
    ? getRedeemBlockReason({
        status: voucher.status,
        remainingAmountCents: Math.round(voucher.balanceChf * 100),
        expiresAt: voucher.expiresAt ?? null,
      })
    : null;
  const canValidate = voucher != null && block == null;
  const usedLabel = voucher ? usedAtLabel(voucher) : null;
  const lastRedemption = voucher?.usageHistory.find((event) => event.kind === "redemption");
  const validatedAmountLabel = lastRedemption
    ? formatChf(lastRedemption.amountUsedChf)
    : voucher
      ? formatChf(voucher.amountChf)
      : "";
  const showCamera = phase === "camera";

  return (
    <DashboardPortal>
      <div
        className="fixed inset-0 z-[70] flex items-end justify-center bg-black sm:items-center sm:p-4"
        role="presentation"
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="scan-gift-voucher-title"
          className={cn(
            "relative flex h-[100dvh] w-full max-w-lg flex-col overflow-hidden bg-black text-white",
            "sm:h-[min(92dvh,760px)] sm:rounded-3xl",
          )}
        >
          <header className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-4 pt-[max(1rem,env(safe-area-inset-top))]">
            <div>
              <h2 id="scan-gift-voucher-title" className="text-lg font-semibold">
                {phase === "success" ? "Bon validé" : phase === "confirm" ? "Confirmer" : "Scanner un bon"}
              </h2>
              <p className="mt-1 text-sm text-white/75">
                {phase === "camera"
                  ? "Placez le QR code dans le cadre"
                  : phase === "success"
                    ? "Ce bon ne peut plus être utilisé."
                    : "Vérifiez les informations avant validation."}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              disabled={busy}
              className="rounded-full bg-white/15 p-2.5 text-white hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:opacity-50"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </header>

          <div className="relative min-h-0 flex-1">
            {showCamera ? (
              <>
                <video
                  ref={videoRef}
                  className="absolute inset-0 h-full w-full object-cover"
                  playsInline
                  muted
                  autoPlay
                />
                <div className="absolute inset-0 bg-black/25" />
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="relative aspect-square w-full max-w-[min(82vw,22rem)] rounded-[1.75rem] border-[3px] border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
                </div>
                {lookingUp ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/55">
                    <p className="text-base font-medium">Identification du bon…</p>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="absolute inset-0 overflow-y-auto px-5 pb-4 pt-24">
                {phase === "success" && voucher ? (
                  <div className="rounded-3xl border border-emerald-400/30 bg-white/10 px-5 py-6">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-8 w-8 text-emerald-300" strokeWidth={2} aria-hidden />
                      <p className="text-lg font-semibold">Bon utilisé avec succès</p>
                    </div>
                    <dl className="mt-5 divide-y divide-white/10">
                      <Row label="Montant validé" value={validatedAmountLabel} />
                      <Row label="Solde restant" value={formatChf(voucher.balanceChf)} />
                      {usedAtLabel(voucher) ? <Row label="Utilisé le" value={usedAtLabel(voucher)!} /> : null}
                    </dl>
                  </div>
                ) : null}

                {voucher && phase !== "success" ? (
                  <div className="rounded-3xl border border-white/15 bg-white/10 px-5 py-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-white/55">Offre</p>
                        <h3 className="mt-1 text-xl font-semibold">
                          {voucher.message?.trim() || "Bon cadeau"}
                        </h3>
                        <p className="mt-1 font-mono text-xs tracking-wide text-white/55">{voucher.code}</p>
                      </div>
                      <p className={cn("text-sm font-semibold", status?.tone)}>{status?.label}</p>
                    </div>
                    <dl className="mt-4 divide-y divide-white/10">
                      <Row label="Valeur" value={formatChf(voucher.amountChf)} />
                      <Row label="Solde restant" value={formatChf(voucher.balanceChf)} />
                      <Row label="Client" value={voucher.buyerName?.trim() || voucher.recipientName?.trim() || "—"} />
                      <Row label="Créé le" value={voucher.purchasedLabel} />
                      <Row label="Expiration" value={voucher.expiresLabel} />
                      {block === "used" && usedLabel ? <Row label="Utilisé le" value={usedLabel} /> : null}
                    </dl>
                    {block === "used" ? (
                      <p className="mt-4 text-sm font-medium text-amber-200">Ce bon a déjà été utilisé.</p>
                    ) : null}
                    {block === "expired" ? (
                      <p className="mt-4 text-sm font-medium text-red-200">Ce bon a expiré.</p>
                    ) : null}
                    {phase === "confirm" ? (
                      <p className="mt-4 text-sm text-white/80">
                        Confirmer la validation de {formatChf(voucher.balanceChf)} ? Cette action est définitive.
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <footer className="relative z-10 space-y-3 bg-gradient-to-t from-black via-black/90 to-transparent px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6">
            {error ? <p className="text-center text-sm font-medium text-red-200">{error}</p> : null}

            {showCamera ? (
              <div className="flex flex-col gap-2">
                {errorKind || error ? (
                  <Button
                    type="button"
                    size="lg"
                    className="min-h-12 w-full text-base"
                    disabled={busy}
                    onClick={() => void startCamera(deviceId)}
                  >
                    <Camera className="h-5 w-5" strokeWidth={2} aria-hidden />
                    Réessayer
                  </Button>
                ) : null}
                {devices.length > 1 ? (
                  <button
                    type="button"
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 text-base font-semibold text-white hover:bg-white/15 disabled:opacity-50"
                    disabled={busy}
                    onClick={switchCamera}
                  >
                    <SwitchCamera className="h-5 w-5" strokeWidth={2} aria-hidden />
                    Changer de caméra
                  </button>
                ) : null}
              </div>
            ) : null}

            {phase === "result" && voucher ? (
              <div className="flex flex-col gap-2">
                {canValidate ? (
                  <Button
                    type="button"
                    size="lg"
                    className="min-h-12 w-full text-base"
                    disabled={busy}
                    onClick={() => {
                      setError(null);
                      setPhase("confirm");
                    }}
                  >
                    Valider ce bon
                  </Button>
                ) : null}
                <button
                  type="button"
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 text-base font-semibold text-white hover:bg-white/15"
                  onClick={() => void startCamera(deviceId)}
                >
                  Scanner un autre bon
                </button>
              </div>
            ) : null}

            {phase === "confirm" ? (
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  size="lg"
                  className="min-h-12 w-full text-base"
                  disabled={busy}
                  onClick={() => void validateVoucher()}
                >
                  {validating ? "Validation…" : "Confirmer la validation"}
                </Button>
                <button
                  type="button"
                  className="flex min-h-11 w-full items-center justify-center rounded-xl text-sm font-medium text-white/70 hover:text-white"
                  disabled={busy}
                  onClick={() => setPhase("result")}
                >
                  Retour
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
                  Scanner un autre bon
                </button>
              </div>
            ) : null}
          </footer>
        </div>
      </div>
    </DashboardPortal>
  );
}
