import Link from "next/link";
import { FitmeAppShell } from "@/components/fitme-app/FitmeAppShell";
import { FitmeReveal } from "@/components/fitme-app/FitmeReveal";

function resumeTitle(status: string | null) {
  if (!status) return "Commencer";
  if (["draft", "uploaded"].includes(status)) return "Reprendre";
  if (["queued", "analyzing"].includes(status)) return "Analyse en cours";
  if (["preview_ready", "awaiting_payment"].includes(status)) return "Aperçu prêt";
  if (["paid", "generating_looks"].includes(status)) return "Looks en cours";
  if (status === "completed") return "Votre Style Profile";
  if (status === "failed") return "Reprendre";
  return "Continuer";
}

function resumeCta(status: string | null) {
  if (!status) return "Commencer mon Style Profile";
  if (["draft", "uploaded"].includes(status)) return "Reprendre là où je me suis arrêté";
  if (["queued", "analyzing"].includes(status)) return "Voir l’analyse en cours";
  if (["preview_ready", "awaiting_payment"].includes(status)) return "Débloquer mon Style Profile";
  if (["paid", "generating_looks"].includes(status)) return "Voir mes looks";
  if (status === "completed") return "Ouvrir mon Style Profile";
  if (status === "failed") return "Reprendre mon analyse";
  return "Continuer";
}

function resumeHint(status: string | null) {
  if (!status) return "Photos, préférences, puis votre analyse.";
  if (["draft", "uploaded"].includes(status)) return "Vos photos sont enregistrées. Il reste peu.";
  if (["queued", "analyzing"].includes(status)) return "L’analyse de vos photos est en cours.";
  if (["preview_ready", "awaiting_payment"].includes(status)) return "L’aperçu est prêt. Un paiement unique débloque tout.";
  if (["paid", "generating_looks"].includes(status)) return "Vos looks personnalisés sont en cours de création.";
  if (status === "completed") return "Votre Style Profile vous attend.";
  return "Reprenez exactement à la bonne étape.";
}

export function StartClient({
  signedIn,
  href,
  status,
  firstName,
}: {
  signedIn: boolean;
  href: string;
  status: string | null;
  firstName: string | null;
}) {
  const hello = firstName?.trim();

  return (
    <FitmeAppShell
      right={
        signedIn ? (
          <Link href="/account" className="fitme-app-bar__link">
            Compte
          </Link>
        ) : (
          <Link href="/login" className="fitme-app-bar__link">
            Se connecter
          </Link>
        )
      }
    >
      <section className="fitme-flow fitme-start">
        <FitmeReveal>
          <p className="fitme-eyebrow">Style Profile</p>
          <h1>{signedIn && hello ? `${hello}, votre style vous attend.` : "Découvrez ce qui vous va vraiment."}</h1>
          <p className="fitme-lead">
            Quelques photos suffisent. FITME identifie les univers et les couleurs qui vous mettent particulièrement en
            valeur — puis compose vos looks.
          </p>
        </FitmeReveal>

        <FitmeReveal delay={0.08} className="fitme-start-points">
          <article>
            <span>01</span>
            <strong>Votre style</strong>
            <p>Les univers qui fonctionnent visuellement avec vous.</p>
          </article>
          <article>
            <span>02</span>
            <strong>Vos couleurs</strong>
            <p>Une palette nette, sans jargon.</p>
          </article>
          <article>
            <span>03</span>
            <strong>Vos looks</strong>
            <p>Des propositions concrètes, sur vous.</p>
          </article>
        </FitmeReveal>

        {signedIn ? (
          <FitmeReveal delay={0.14}>
            <article className="fitme-resume-card">
              <p className="fitme-eyebrow">Reprendre</p>
              <h2>{resumeTitle(status)}</h2>
              <p className="fitme-lead">{resumeHint(status)}</p>
              <Link href={href} className="fitme-cta fitme-cta--block">
                {resumeCta(status)}
              </Link>
            </article>
          </FitmeReveal>
        ) : (
          <FitmeReveal delay={0.14} className="fitme-sticky-cta">
            <Link href="/signup" className="fitme-cta fitme-cta--block">
              Commencer
            </Link>
            <p className="fitme-fine">Sans abonnement. Vous avancez à votre rythme.</p>
          </FitmeReveal>
        )}
      </section>
    </FitmeAppShell>
  );
}
