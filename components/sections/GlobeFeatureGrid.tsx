"use client";

import { motion } from "framer-motion";
import { CalendarCheck, Palette, Pencil, Smartphone, Wallet, Zap, type LucideIcon } from "lucide-react";
import { cn } from "@/src/lib/utils";

type FeatureItem = {
  icon: LucideIcon;
  title: string;
  description: string;
  highlight?: boolean;
  badge?: string;
};

const items: FeatureItem[] = [
  {
    icon: Pencil,
    title: "Modifiable en 30 secondes",
    description:
      "Mets à jour menu, horaires et visuels en quelques clics. Fini les allers-retours avec une agence ou les fichiers à renvoyer.",
  },
  {
    icon: CalendarCheck,
    title: "Réservation au cœur de ta page",
    description:
      "Le parcours de réservation est au centre : ton client réserve sans quitter ta page, sans friction ni outil externe.",
  },
  {
    icon: Smartphone,
    title: "Pensée pour le mobile",
    description:
      "Interface tactile, chargement rapide et parcours court sur smartphone — là où la plupart de tes visiteurs décident.",
  },
  {
    icon: Palette,
    title: "Un design qui te ressemble",
    description:
      "Couleurs, typo, photos et ton alignés sur ton établissement. Une page premium qui reflète ton identité.",
  },
  {
    icon: Wallet,
    title: "49 CHF/mois, tout inclus",
    description:
      "Au lieu de 3'500 CHF pour un site web classique + 50 CHF/mois pour un outil de réservation séparé. Sans engagement, résiliable à tout moment.",
    highlight: true,
    badge: "★ Le meilleur deal",
  },
  {
    icon: Zap,
    title: "En ligne en 10 minutes",
    description:
      "Pas d'agence, pas de devis, pas de relance. Tu remplis tes infos, ZenGrow génère ta page, et tu reçois tes premières réservations le jour même.",
  },
];

function IconOrb({ Icon, intense }: { Icon: LucideIcon; intense?: boolean }) {
  return (
    <div
      className={
        intense
          ? "flex size-14 shrink-0 items-center justify-center rounded-full border border-landing-accent/55 bg-landing-accent/15 text-landing-accent-soft shadow-[0_0_36px_6px_rgba(255,107,44,0.5)]"
          : "flex size-14 shrink-0 items-center justify-center rounded-full border border-landing-accent/45 bg-landing-card/80 text-landing-accent-soft shadow-[0_0_28px_4px_rgba(255,107,44,0.38)]"
      }
    >
      <Icon className="size-7" strokeWidth={1.35} aria-hidden />
    </div>
  );
}

export function GlobeFeatureGrid() {
  return (
    <div className="mx-auto mt-20 w-full max-w-7xl">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => {
          const isHighlight = item.highlight === true;
          return (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 22, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: 0.08 * i, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
              }}
              className={cn(
                "relative flex flex-col overflow-hidden rounded-2xl p-8",
                isHighlight ? "landing-surface landing-surface--featured" : "landing-surface",
              )}
            >
              {item.badge ? (
                <span className="absolute right-5 top-5 rounded-full border border-landing-accent/25 bg-landing-accent/10 px-2.5 py-1 text-[11px] font-semibold leading-none text-landing-accent">
                  {item.badge}
                </span>
              ) : null}
              <IconOrb Icon={item.icon} intense={isHighlight} />
              <h3 className="mt-6 font-landing-serif text-2xl font-normal text-landing-fg">{item.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-landing-muted">{item.description}</p>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
