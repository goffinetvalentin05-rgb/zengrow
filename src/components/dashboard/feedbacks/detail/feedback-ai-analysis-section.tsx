"use client";

import { useState } from "react";
import Button from "@/src/components/ui/button";
import FeedbackDetailSection from "@/src/components/dashboard/feedbacks/detail/feedback-detail-section";
import CopyTextButton from "@/src/components/dashboard/ai/copy-text-button";
import type { PrivateFeedbackAIAnalysis } from "@/src/lib/ai/types";
import { cn } from "@/src/lib/utils";

const SENTIMENT_LABELS: Record<PrivateFeedbackAIAnalysis["sentiment"], string> = {
  positive: "Positif",
  neutral: "Neutre",
  negative: "Négatif",
};

const URGENCY_LABELS: Record<PrivateFeedbackAIAnalysis["urgency"], string> = {
  low: "Faible",
  medium: "Moyenne",
  high: "Élevée",
};

type FeedbackAIAnalysisSectionProps = {
  feedbackId: string;
  restaurantId: string;
  feedbackText: string | null;
  rating: number;
  initialAnalysis: PrivateFeedbackAIAnalysis | null;
  onAnalysisSaved: (analysis: PrivateFeedbackAIAnalysis) => void;
};

export default function FeedbackAIAnalysisSection({
  feedbackId,
  restaurantId,
  feedbackText,
  rating,
  initialAnalysis,
  onAnalysisSaved,
}: FeedbackAIAnalysisSectionProps) {
  const [analysis, setAnalysis] = useState<PrivateFeedbackAIAnalysis | null>(initialAnalysis);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runAnalysis(regenerate = false) {
    if (!feedbackText?.trim()) {
      setError("Ce retour ne contient pas de message à analyser.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/private-feedback-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          feedbackId,
          feedbackText,
          rating,
          regenerate,
        }),
      });
      const data = (await res.json()) as {
        analysis?: PrivateFeedbackAIAnalysis;
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Analyse impossible.");
        return;
      }
      if (data.analysis) {
        setAnalysis(data.analysis);
        onAnalysisSaved(data.analysis);
      }
    } catch {
      setError("Analyse impossible. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <FeedbackDetailSection title="Analyse IA">
      {!analysis ? (
        <div className="space-y-3">
          <p className="text-sm text-zg-text-muted">
            Obtenez un résumé, le sentiment, une réponse conseillée et une action recommandée.
          </p>
          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={loading}
            onClick={() => void runAnalysis(false)}
          >
            {loading ? "Analyse en cours…" : "Analyser avec l'IA"}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-semibold",
                analysis.sentiment === "negative"
                  ? "bg-red-500/15 text-red-700 dark:text-red-300"
                  : analysis.sentiment === "positive"
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    : "bg-zg-surface-elevated text-zg-text-muted",
              )}
            >
              {SENTIMENT_LABELS[analysis.sentiment]}
            </span>
            <span className="rounded-full bg-zg-surface-elevated px-2.5 py-1 text-xs font-semibold text-zg-text-muted">
              Urgence : {URGENCY_LABELS[analysis.urgency]}
            </span>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zg-fg-muted">Résumé</p>
            <p className="mt-1 text-sm text-zg-fg">{analysis.summary}</p>
          </div>

          {analysis.mainIssue ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zg-fg-muted">
                Problème principal
              </p>
              <p className="mt-1 text-sm text-zg-fg">{analysis.mainIssue}</p>
            </div>
          ) : null}

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zg-fg-muted">
              Réponse conseillée
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-zg-fg">{analysis.suggestedReply}</p>
            <CopyTextButton text={analysis.suggestedReply} className="mt-2" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zg-fg-muted">
              Action recommandée
            </p>
            <p className="mt-1 text-sm text-zg-fg">{analysis.recommendedAction}</p>
          </div>

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={loading}
            onClick={() => void runAnalysis(true)}
          >
            {loading ? "Regénération…" : "Regénérer l'analyse"}
          </Button>
        </div>
      )}
    </FeedbackDetailSection>
  );
}
