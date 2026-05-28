"use client";

import { useState } from "react";
import Button from "@/src/components/ui/button";
import Select from "@/src/components/ui/select";
import Input from "@/src/components/ui/input";
import type { ImproveReviewEmailAIResult } from "@/src/lib/ai/types";

type ImproveReviewEmailSectionProps = {
  restaurantId: string;
  restaurantName: string;
  currentSubject: string;
  currentBody: string;
  onApply: (subject: string, body: string) => void;
  onUsageRefresh?: () => void;
  atLimit?: boolean;
};

export default function ImproveReviewEmailSection({
  restaurantId,
  restaurantName,
  currentSubject,
  currentBody,
  onApply,
  onUsageRefresh,
  atLimit = false,
}: ImproveReviewEmailSectionProps) {
  const [language, setLanguage] = useState("fr");
  const [tone, setTone] = useState("");
  const [preview, setPreview] = useState<ImproveReviewEmailAIResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function improve() {
    if (atLimit) return;
    setLoading(true);
    setError(null);
    setPreview(null);

    try {
      const res = await fetch("/api/ai/improve-review-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          restaurantName,
          currentText: `${currentSubject}\n\n${currentBody}`,
          tone: tone || undefined,
          language,
        }),
      });
      const data = (await res.json()) as ImproveReviewEmailAIResult & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Génération impossible.");
        return;
      }
      setPreview({ subject: data.subject, body: data.body });
      setOpen(true);
      onUsageRefresh?.();
    } catch {
      setError("Génération impossible. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-dashed border-zg-border/80 bg-zg-surface-elevated/50 p-4">
      <p className="text-sm font-medium text-zg-fg">Amélioration IA du modèle d&apos;e-mail</p>
      <p className="text-xs text-zg-text-muted">
        L&apos;IA propose un objet et un corps courts. Les variables {"{{client_name}}"},{" "}
        {"{{restaurant_name}}"}, {"{{review_link}}"} sont préservées si présentes.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="dashboard-field-label">Langue</label>
          <Select className="mt-2" value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="fr">Français</option>
            <option value="de">Allemand</option>
            <option value="en">Anglais</option>
          </Select>
        </div>
        <div>
          <label className="dashboard-field-label">Ton (optionnel)</label>
          <Input className="mt-2" value={tone} onChange={(e) => setTone(e.target.value)} placeholder="Chaleureux…" />
        </div>
      </div>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="button" variant="secondary" size="sm" disabled={loading || atLimit} onClick={() => void improve()}>
        {loading ? "Génération…" : "Améliorer avec l'IA"}
      </Button>

      {open && preview ? (
        <div className="space-y-3 rounded-xl border border-zg-border bg-zg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zg-fg-muted">Proposition IA</p>
          <p className="text-sm font-semibold text-zg-fg">{preview.subject}</p>
          <p className="whitespace-pre-wrap text-sm text-zg-text-secondary">{preview.body}</p>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              onApply(preview.subject, preview.body);
              setOpen(false);
            }}
          >
            Utiliser ce modèle
          </Button>
        </div>
      ) : null}
    </div>
  );
}
