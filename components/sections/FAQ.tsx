"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { cn } from "@/src/lib/utils";

const faqs = [
  {
    id: "q1",
    tag: "Installation",
    q: "Combien de temps pour mettre en place ma page ?",
    a: "Tout dépend de toi : tu peux avoir ta page en ligne en 10 minutes si tu remplis tes infos rapidement. Si tu veux un visuel plus poussé, notre équipe peut t'accompagner pour la créer ensemble.",
  },
  {
    id: "q2",
    tag: "Installation",
    q: "Dois-je avoir des compétences techniques ?",
    a: "Aucune. Si tu sais utiliser ton smartphone, tu sais utiliser ZenGrow. Tu remplis tes infos, tu choisis tes couleurs et tes photos, et c'est en ligne.",
  },
  {
    id: "q3",
    tag: "Compatibilité",
    q: "Est-ce compatible avec mon site existant ?",
    a: "Oui. Tu peux soit utiliser ZenGrow comme ta page principale (et abandonner ton ancien site), soit l'utiliser uniquement comme page de réservation liée depuis ton site actuel.",
  },
  {
    id: "q4",
    tag: "Personnalisation",
    q: "Puis-je personnaliser ma page comme je veux ?",
    a: "Totalement. Couleurs, photos, style, ambiance, menu, horaires : tu fais ta page à ton image. Si tu veux quelque chose de plus poussé, notre équipe est là pour t'aider.",
  },
  {
    id: "q5",
    tag: "Engagement",
    q: "Y a-t-il un engagement ?",
    a: "Aucun. Mensuel, sans engagement, résiliable à tout moment depuis ton dashboard. Tu testes, et si ça ne te convient pas tu arrêtes.",
  },
  {
    id: "q6",
    tag: "Paiement",
    q: "Comment fonctionne le paiement ?",
    a: "49 CHF/mois TTC, prélevé chaque mois. Pas de frais cachés, pas de commission sur tes réservations. Tu paies un abonnement fixe, c'est tout.",
  },
  {
    id: "q7",
    tag: "Personnalisation",
    q: "Que se passe-t-il si je veux changer quelque chose après ?",
    a: "Tu modifies ce que tu veux directement depuis ton dashboard, en quelques secondes. Horaires, menu du jour, photos, événements : tout est éditable à tout moment, depuis ton téléphone.",
  },
  {
    id: "q8",
    tag: "Sécurité",
    q: "Mes données et celles de mes clients sont-elles sécurisées ?",
    a: "Oui. Tes données et celles de tes clients sont hébergées en Europe, conformes au RGPD, et chiffrées. On ne les revend jamais.",
  },
  {
    id: "q9",
    tag: "Support",
    q: "Le support est-il en français ?",
    a: "Oui, support 100% français par mail. On répond rapidement.",
  },
  {
    id: "q10",
    tag: "Essai",
    q: "Puis-je essayer avant de m'engager ?",
    a: "Tu peux créer ton compte et commencer à construire ta page gratuitement. Le paiement ne se déclenche qu'au moment où tu mets ta page en ligne.",
  },
] as const;

const leftColumn = faqs.slice(0, 5);
const rightColumn = faqs.slice(5, 10);

type FaqEntry = (typeof faqs)[number];

function FaqCard({
  item,
  index,
  openId,
  onToggle,
}: {
  item: FaqEntry;
  index: number;
  openId: string | null;
  onToggle: (id: string) => void;
}) {
  const isOpen = openId === item.id;
  const panelId = `${item.id}-panel`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-24px" }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "landing-surface rounded-xl border-l-2 border-l-transparent p-5 backdrop-blur-sm",
        !isOpen && "hover:border-l-landing-accent",
        isOpen &&
          "!border-l-landing-accent !border-[rgb(255_100_50/0.28)] bg-[rgb(255_255_255/0.03)] shadow-[0_0_28px_-10px_rgba(255,107,44,0.28)]",
      )}
    >
      <button
        type="button"
        id={`${item.id}-trigger`}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => onToggle(item.id)}
        className="flex w-full cursor-pointer items-start justify-between gap-4 text-left transition-colors duration-300"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <span className="inline-flex w-fit shrink-0 rounded-full border border-landing-accent/20 bg-landing-accent/10 px-2 py-0.5 text-xs font-medium text-landing-accent">
            {item.tag}
          </span>
          <span className="text-base font-medium text-landing-fg">{item.q}</span>
        </div>
        <span className="relative mt-0.5 flex size-8 shrink-0 items-center justify-center" aria-hidden>
          <AnimatePresence mode="wait" initial={false}>
            {isOpen ? (
              <motion.span
                key="x"
                initial={{ opacity: 0, rotate: -75 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 75 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 flex items-center justify-center text-landing-accent"
              >
                <X className="size-5" strokeWidth={2} />
              </motion.span>
            ) : (
              <motion.span
                key="plus"
                initial={{ opacity: 0, rotate: 75 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: -75 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 flex items-center justify-center text-landing-muted"
              >
                <Plus className="size-5" strokeWidth={2} />
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={`${item.id}-trigger`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="landing-divider border-t pt-4">
              <p className="text-sm leading-relaxed text-landing-muted">{item.a}</p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQ() {
  const headingId = useId();
  const [openId, setOpenId] = useState<string | null>(null);

  function toggle(id: string) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  return (
    <section id="faq" className="relative bg-landing-section py-24 sm:py-28" aria-labelledby={headingId}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_40%_at_50%_0%,rgba(255,107,44,0.08),transparent)]" />
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 id={headingId} className="font-landing-serif text-[clamp(2rem,4vw,3rem)] font-normal text-landing-fg">
            Tout ce que tu dois savoir{" "}
            <em className="italic text-landing-accent">avant de te lancer</em>
          </h2>
          <p className="mt-3 text-sm text-landing-muted">
            Tarif, essai, données : les réponses claires pour décider sereinement.
          </p>
        </motion.div>

        <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-6">
            {leftColumn.map((item, i) => (
              <FaqCard key={item.id} item={item} index={i} openId={openId} onToggle={toggle} />
            ))}
          </div>
          <div className="flex flex-col gap-6">
            {rightColumn.map((item, i) => (
              <FaqCard key={item.id} item={item} index={i + 5} openId={openId} onToggle={toggle} />
            ))}
          </div>
        </div>

        <motion.div
          className="mx-auto mt-12 flex max-w-lg flex-col items-center gap-3"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            href="mailto:contact@zengrow.ch"
            className="landing-btn-secondary inline-flex min-h-11 items-center justify-center rounded-full px-6 py-3 text-sm font-medium backdrop-blur-sm"
          >
            Nous contacter
          </Link>
          <p className="text-center text-xs text-landing-muted">
            Tu as une autre question ? Notre équipe te répond en 24h.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
