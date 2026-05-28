"use client";

import { useState } from "react";
import Button from "@/src/components/ui/button";
import Select from "@/src/components/ui/select";
import Textarea from "@/src/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import CopyTextButton from "@/src/components/dashboard/ai/copy-text-button";
import type { useAIUsage } from "@/src/components/dashboard/ai/use-ai-usage";

type GoogleReviewTabProps = {
  restaurantId: string;
  usage: ReturnType<typeof useAIUsage>["usage"];
  onUsageRefresh: () => void;
};

export default function GoogleReviewTab({ restaurantId, usage, onUsageRefresh }: GoogleReviewTabProps) {
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState("5");
  const [tone, setTone] = useState("professional");
  const [language, setLanguage] = useState("fr");
  const [length, setLength] = useState("medium");
  const [reply, setReply] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const atLimit = usage != null && usage.used >= usage.limit;

  async function generate(regenerate = false) {
    if (!reviewText.trim()) {
      setError("Collez un avis Google pour générer une réponse.");
      return;
    }
    if (atLimit) return;

    setLoading(true);
    setError(null);
    if (!regenerate) setReply(null);

    try {
      const res = await fetch("/api/ai/google-review-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewText,
          rating: Number(rating),
          tone,
          language,
          length,
          restaurantId,
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Génération impossible.");
        return;
      }
      setReply(data.reply ?? "");
      onUsageRefresh();
    } catch {
      setError("Génération impossible. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Réponses Google</CardTitle>
        <CardDescription>
          Collez un avis reçu sur Google et obtenez une réponse prête à publier.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="dashboard-field-label">Collez ici l&apos;avis Google</label>
          <Textarea
            className="mt-2 min-h-32"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            maxLength={3000}
            placeholder="Ex. : Très bon repas, service attentionné…"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="dashboard-field-label">Note</label>
            <Select className="mt-2" value={rating} onChange={(e) => setRating(e.target.value)}>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={String(n)}>
                  {n} / 5
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="dashboard-field-label">Ton</label>
            <Select className="mt-2" value={tone} onChange={(e) => setTone(e.target.value)}>
              <option value="professional">Professionnel</option>
              <option value="warm">Chaleureux</option>
              <option value="premium">Premium</option>
              <option value="simple">Simple</option>
            </Select>
          </div>
          <div>
            <label className="dashboard-field-label">Langue</label>
            <Select className="mt-2" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="fr">Français</option>
              <option value="de">Allemand</option>
              <option value="en">Anglais</option>
            </Select>
          </div>
          <div>
            <label className="dashboard-field-label">Longueur</label>
            <Select className="mt-2" value={length} onChange={(e) => setLength(e.target.value)}>
              <option value="short">Courte</option>
              <option value="medium">Moyenne</option>
            </Select>
          </div>
        </div>

        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        <Button
          type="button"
          disabled={loading || atLimit}
          onClick={() => void generate(false)}
          className="min-h-11"
        >
          {loading ? "Génération…" : "Générer une réponse"}
        </Button>

        {reply ? (
          <div className="space-y-3 rounded-2xl border border-zg-border bg-zg-surface-elevated p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-zg-fg-muted">Réponse</p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zg-fg">{reply}</p>
            <div className="flex flex-wrap gap-2">
              <CopyTextButton text={reply} label="Copier la réponse" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={loading || atLimit}
                onClick={() => void generate(true)}
              >
                Regénérer
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
