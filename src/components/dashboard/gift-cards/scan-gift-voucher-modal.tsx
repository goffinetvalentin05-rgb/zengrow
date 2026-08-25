"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, SwitchCamera, X } from "lucide-react";
import { useDialogFocusTrap } from "@/src/components/dashboard/reservations/hooks/use-dialog-focus-trap";
import DashboardPortal from "@/src/components/dashboard/ui/dashboard-portal";
import Button from "@/src/components/ui/button";
import { parseGiftVoucherQrPayload } from "@/src/lib/gift-vouchers/public-token";
import { cn } from "@/src/lib/utils";
import type { GiftCardRecord } from "@/src/components/dashboard/gift-cards/types";

type ScanGiftVoucherModalProps = {
  open: boolean;
  onClose: () => void;
  onVoucherFound: (result: { voucher: GiftCardRecord; redeemable: boolean; error: string | null }) => void;
};

type CameraErrorKind = "permission" | "unavailable" | "unsupported";

type LookupPayload = {
  voucher?: GiftCardRecord;
  redeemable?: boolean;
  error?: string;
};

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

export default function ScanGiftVoucherModal({ open, onClose, onVoucherFound }: ScanGiftVoucherModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const detectingRef = useRef(false);
  const stoppedRef = useRef(true);
  const sessionRef = useRef(0);
  const lastInvalidAtRef = useRef(0);
  const lookupTokenRef = useRef<(token: string) => Promise<void>>(async () => undefined);

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorKind, setErrorKind] = useState<CameraErrorKind | null>(null);
  const [lookingUp, setLookingUp] = useState(false);

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

  const handleClose = useCallback(() => {
    if (lookingUp) return;
    stopCamera();
    onClose();
  }, [lookingUp, onClose, stopCamera]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !lookingUp) handleClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, handleClose, lookingUp]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const lookupToken = useCallback(
    async (token: string) => {
      setLookingUp(true);
      setError(null);
      try {
        const response = await fetch(`/api/gift-vouchers/lookup-token?token=${encodeURIComponent(token)}`);
        const payload = (await response.json().catch(() => null)) as LookupPayload | null;
        if (!response.ok || !payload?.voucher) {
          setError(payload?.error ?? "Ce bon n’existe pas.");
          setErrorKind("unavailable");
          setLookingUp(false);
          return;
        }
        onVoucherFound({
          voucher: payload.voucher,
          redeemable: payload.redeemable !== false,
          error: payload.error ?? null,
        });
      } catch {
        setError("Impossible de rechercher ce bon. Vérifiez votre connexion.");
        setErrorKind("unavailable");
      } finally {
        setLookingUp(false);
      }
    },
    [onVoucherFound],
  );

  lookupTokenRef.current = lookupToken;

  const onDecoded = useCallback(
    async (raw: string) => {
      if (detectingRef.current || stoppedRef.current) return;
      const token = parseGiftVoucherQrPayload(raw);
      if (!token) {
        const now = Date.now();
        if (now - lastInvalidAtRef.current > 1600) {
          lastInvalidAtRef.current = now;
          setError("Ce QR code n’est pas un bon ZenGrow valide.");
        }
        return;
      }
      detectingRef.current = true;
      stopCamera();
      await lookupTokenRef.current(token);
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

  if (!open) return null;

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
                Scanner un bon
              </h2>
              <p className="mt-1 text-sm text-white/75">Placez le QR code dans le cadre</p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              disabled={lookingUp}
              className="rounded-full bg-white/15 p-2.5 text-white hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:opacity-50"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </header>

          <div className="relative min-h-0 flex-1">
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
          </div>

          <footer className="relative z-10 space-y-3 bg-gradient-to-t from-black via-black/90 to-transparent px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6">
            {error ? <p className="text-center text-sm font-medium text-red-200">{error}</p> : null}
            <div className="flex flex-col gap-2">
              {errorKind || error ? (
                <Button
                  type="button"
                  size="lg"
                  className="min-h-12 w-full text-base"
                  disabled={lookingUp}
                  onClick={() => void startCamera(deviceId)}
                >
                  <Camera className="h-5 w-5" strokeWidth={2} aria-hidden />
                  Réessayer
                </Button>
              ) : null}
              {devices.length > 1 ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  className="min-h-12 w-full text-base"
                  disabled={lookingUp}
                  onClick={switchCamera}
                >
                  <SwitchCamera className="h-5 w-5" strokeWidth={2} aria-hidden />
                  Changer de caméra
                </Button>
              ) : null}
            </div>
          </footer>
        </div>
      </div>
    </DashboardPortal>
  );
}
