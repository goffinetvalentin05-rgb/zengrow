"use client";

import { FormEvent, useState } from "react";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import Select from "@/src/components/ui/select";
import Textarea from "@/src/components/ui/textarea";

type FeedbackFormProps =
  | {
      variant: "token";
      token: string;
      restaurantName: string;
      initialRating: number;
      initialResponseLabel: string;
    }
  | {
      variant: "legacy";
      reservationId: string;
      restaurantId: string;
      initialRating: number;
      initialName: string;
      initialEmail: string;
    };

export default function FeedbackForm(props: FeedbackFormProps) {
  const isToken = props.variant === "token";
  const [name, setName] = useState(isToken ? "" : props.initialName);
  const [rating, setRating] = useState(props.initialRating);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!message.trim()) {
      setError("Merci de préciser votre retour.");
      return;
    }
    if (!isToken && !name.trim()) {
      setError("Merci de renseigner votre nom.");
      return;
    }

    setLoading(true);

    const body = isToken
      ? { token: props.token, rating, message: message.trim() }
      : {
          reservationId: props.reservationId,
          restaurantId: props.restaurantId,
          rating,
          customerName: name.trim(),
          customerEmail: props.initialEmail,
          message: message.trim(),
        };

    const response = await fetch("/api/feedback/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const payload = (await response.json().catch(() => ({}))) as { error?: string };

    if (!response.ok) {
      setError(payload.error || "Impossible d'envoyer votre retour.");
      setLoading(false);
      return;
    }

    window.location.href = "/feedback/thank-you";
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          {isToken ? props.restaurantName : "Que pouvons-nous améliorer ?"}
        </h1>
        {isToken ? (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Vous aviez indiqué une expérience « {props.initialResponseLabel} ». Dites-nous ce qui n&apos;a pas été — votre
            avis reste privé et sera lu par l&apos;équipe du restaurant.
          </p>
        ) : (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Votre retour privé sera visible par le restaurant dans son tableau de bord ZenGrow.
          </p>
        )}
      </div>

      {!isToken ? (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--foreground)]/85">Nom</label>
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Votre nom" />
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--foreground)]/85">Note</label>
        {isToken ? (
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`h-11 w-11 rounded-full text-lg font-semibold transition ${
                  rating >= star ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500"
                }`}
                aria-label={`${star} étoile${star > 1 ? "s" : ""}`}
              >
                ★
              </button>
            ))}
          </div>
        ) : (
          <Select value={String(rating)} onChange={(event) => setRating(Number(event.target.value))}>
            <option value="1">1/5</option>
            <option value="2">2/5</option>
            <option value="3">3/5</option>
            <option value="4">4/5</option>
            <option value="5">5/5</option>
          </Select>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--foreground)]/85">Dites-nous ce qui n&apos;a pas été</label>
        <Textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Votre message nous aide à nous améliorer."
          className="min-h-32"
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Envoi..." : "Envoyer mon avis"}
      </Button>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </form>
  );
}
