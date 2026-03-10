"use client";

import { FormEvent, useState } from "react";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import Textarea from "@/src/components/ui/textarea";

type FeedbackFormProps = {
  reservationId: string;
  initialRating: number;
  initialName: string;
  initialEmail: string;
};

export default function FeedbackForm({ reservationId, initialRating, initialName, initialEmail }: FeedbackFormProps) {
  const [name, setName] = useState(initialName);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!message.trim()) {
      setError("Merci de preciser votre retour.");
      return;
    }
    if (!name.trim()) {
      setError("Merci de renseigner votre nom.");
      return;
    }

    setLoading(true);

    const response = await fetch("/api/feedback/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reservationId,
        rating: initialRating,
        customerName: name.trim(),
        customerEmail: initialEmail,
        message: message.trim(),
      }),
    });

    const payload = (await response.json().catch(() => ({}))) as { error?: string };

    if (!response.ok) {
      console.error("Feedback submit failed", payload.error);
      setError(payload.error || "Impossible d'envoyer votre retour.");
      setLoading(false);
      return;
    }

    window.location.href = "/feedback/thank-you";
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Que pouvons-nous ameliorer ?</h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Votre feedback prive sera visible par le restaurant dans son tableau de bord ZenGrow.
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--foreground)]/85">Nom</label>
        <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Votre nom" />
      </div>

      <Textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Expliquez-nous ce qui pourrait etre mieux..."
        className="min-h-32"
      />

      <Button type="submit" disabled={loading}>
        {loading ? "Envoi..." : "Envoyer mon feedback"}
      </Button>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-700">{success}</p> : null}
    </form>
  );
}
