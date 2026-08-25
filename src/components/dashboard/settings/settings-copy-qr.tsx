"use client";

import { useState } from "react";
import QRCode from "react-qr-code";
import Button from "@/src/components/ui/button";

type SettingsQrBlockProps = {
  value: string;
  filename: string;
  label: string;
};

export function SettingsQrBlock({ value, filename, label }: SettingsQrBlockProps) {
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function download() {
    setDownloading(true);
    setMessage(null);
    try {
      const QRCodeLib = (await import("qrcode")).default;
      const dataUrl = await QRCodeLib.toDataURL(value, {
        width: 720,
        margin: 2,
        color: { dark: "#111111", light: "#ffffff" },
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = filename;
      link.click();
    } catch {
      setMessage("Impossible de télécharger le QR.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <figure className="inline-flex flex-col items-center">
        <div className="rounded-2xl bg-white p-3">
          <QRCode value={value} size={128} bgColor="#ffffff" fgColor="#111111" level="M" />
        </div>
        <figcaption className="sr-only">{label}</figcaption>
      </figure>
      <div className="min-w-0">
        <Button type="button" variant="secondary" size="sm" disabled={downloading} onClick={() => void download()}>
          {downloading ? "Préparation…" : "Télécharger le QR"}
        </Button>
        {message ? <p className="mt-2 text-sm text-zg-danger">{message}</p> : null}
      </div>
    </div>
  );
}

export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function copy(value: string) {
    setError(null);
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Impossible de copier. Sélectionnez le texte manuellement.");
    }
  }

  return { copied, error, copy };
}
