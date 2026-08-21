"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FitmeAppShell } from "@/components/fitme-app/FitmeAppShell";
import { createClient } from "@/src/lib/supabase/client";

type Props = {
  firstName: string | null;
  email: string | null;
  card: {
    id: string;
    status: string;
    isUnlocked: boolean;
    createdAt: string;
    primaryStyle: string | null;
  } | null;
};

function destination(card: Props["card"]) {
  if (!card) return { href: "/onboarding", label: "Découvrir mon style" };
  if (["draft", "uploaded"].includes(card.status)) {
    return { href: "/onboarding", label: "Continuer mon analyse" };
  }
  if (["queued", "analyzing"].includes(card.status) || (card.status === "failed" && !card.isUnlocked)) {
    return { href: `/analysis/${card.id}`, label: "Continuer mon analyse" };
  }
  if (["preview_ready", "awaiting_payment"].includes(card.status)) {
    return { href: `/analysis/${card.id}/preview`, label: "Voir mon aperçu" };
  }
  if (card.status === "generating_looks" || (card.status === "failed" && card.isUnlocked)) {
    return { href: `/payment/success?analysis_id=${card.id}`, label: "Voir mes looks" };
  }
  return { href: "/style-profile", label: "Voir mon Style Profile" };
}

export function AccountClient({ firstName, email, card }: Props) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const action = destination(card);
  const hello = firstName?.trim() || "vous";

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  async function deletePhotos() {
    setBusy(true);
    setMessage(null);
    const response = await fetch("/api/style/account/photos", { method: "POST" });
    setBusy(false);
    if (!response.ok) {
      setMessage("Impossible de supprimer les photos pour le moment.");
      return;
    }
    setMessage("Vos photos ont été supprimées.");
  }

  return (
    <FitmeAppShell
      right={
        <button type="button" className="fitme-app-bar__link" onClick={() => void logout()}>
          Déconnexion
        </button>
      }
    >
      <section className="fitme-flow">
        <p className="fitme-eyebrow">Compte</p>
        <h1>Bonjour {hello}</h1>
        <p className="fitme-lead">{email}</p>

        <article className="fitme-account-card">
          <p className="fitme-eyebrow">Votre Style Profile</p>
          {card ? (
            <>
              <p className="fitme-display" style={{ fontSize: "1.6rem", marginTop: "0.4rem" }}>
                {card.primaryStyle ??
                  (["preview_ready", "awaiting_payment"].includes(card.status)
                    ? "Prêt à débloquer"
                    : "Analyse en cours")}
              </p>
              <p className="fitme-fine">
                {new Date(card.createdAt).toLocaleDateString("fr-CH")} · {card.status}
              </p>
            </>
          ) : (
            <p className="fitme-lead">Aucun Style Profile pour le moment.</p>
          )}
          <div style={{ marginTop: "1rem" }}>
            <Link href={action.href} className="fitme-cta fitme-cta--block">
              {action.label}
            </Link>
          </div>
        </article>

        <article className="fitme-account-card">
          <p className="fitme-eyebrow">Paramètres</p>
          <p className="fitme-lead">Vos photos restent privées. Vous pouvez les supprimer à tout moment.</p>
          <button type="button" className="fitme-cta fitme-cta--ghost" disabled={busy} onClick={() => void deletePhotos()}>
            {busy ? "Suppression…" : "Supprimer mes photos"}
          </button>
          {message ? <p className="fitme-note">{message}</p> : null}
        </article>
      </section>
    </FitmeAppShell>
  );
}
