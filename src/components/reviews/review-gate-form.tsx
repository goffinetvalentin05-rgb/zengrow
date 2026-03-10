"use client";

import { FormEvent, useState } from "react";
import Button from "@/src/components/ui/button";
import Textarea from "@/src/components/ui/textarea";

type ReviewGateFormProps = {
  reservationId: string;
};

export default function ReviewGateForm({ reservationId }: ReviewGateFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const showPrivateFeedback = rating > 0 && rating <= 3;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (rating < 1 || rating > 5) {
      setError("Veuillez selectionner une note.");
      return;
    }

    if (showPrivateFeedback && !message.trim()) {
      setError("Merci de preciser votre retour.");
      return;
    }

    setLoading(true);

    const response = await fetch("/api/reviews/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reservationId,
        rating,
        message: showPrivateFeedback ? message.trim() : "",
      }),
    });

    const payload = (await response.json()) as {
      error?: string;
      redirectToGoogle?: boolean;
      googleReviewUrl?: string | null;
    };

    if (!response.ok) {
      setError(payload.error || "Impossible d'envoyer votre avis.");
      setLoading(false);
      return;
    }

    if (payload.redirectToGoogle) {
      if (payload.googleReviewUrl) {
        window.location.href = payload.googleReviewUrl;
        return;
      }

      setSuccess("Merci ! Votre avis est enregistré.");
      setLoading(false);
      return;
    }

    setSuccess("Merci pour votre retour privé. Nous allons nous améliorer.");
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Comment s&apos;est passée votre expérience ?</h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">Choisissez une note de 1 à 5 étoiles.</p>
      </div>

      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={`h-10 w-10 rounded-full text-lg font-semibold transition ${
              rating >= star ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500"
            }`}
            aria-label={`${star} étoile${star > 1 ? "s" : ""}`}
          >
            ★
          </button>
        ))}
      </div>

      {showPrivateFeedback ? (
        <div className="space-y-2">
          <p className="text-sm text-[var(--foreground)]/85">
            Désolé que votre expérience n&apos;ait pas été parfaite. Pouvez-vous nous dire ce qui s&apos;est passé ?
          </p>
          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Votre message"
            className="min-h-28"
          />
        </div>
      ) : null}

      <Button type="submit" disabled={loading || rating === 0}>
        {loading ? "Envoi..." : rating >= 4 ? "Laisser un avis sur Google" : "Envoyer mon retour"}
      </Button>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-700">{success}</p> : null}
    </form>
  );
}
