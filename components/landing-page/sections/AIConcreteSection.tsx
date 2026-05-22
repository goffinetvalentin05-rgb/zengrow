"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  CalendarPlus,
  Megaphone,
  RotateCcw,
  Sparkles,
  Star,
  UtensilsCrossed,
} from "lucide-react";
import { Container, GlassCard, Section, SectionHeader } from "@/components/landing-page/ui";
import { ScrollReveal } from "@/components/landing-page/ScrollReveal";

const USE_CASES = [
  { icon: UtensilsCrossed, label: "Remplir un soir calme" },
  { icon: RotateCcw, label: "Faire revenir les anciens clients" },
  { icon: Megaphone, label: "Promouvoir un menu spécial" },
  { icon: Star, label: "Demander plus d'avis Google" },
] as const;

const TYPING_MESSAGE =
  "Bonjour ! Cela fait un moment que nous ne vous avons pas vus. Une table vous attend ce vendredi — souhaitez-vous réserver ?";

function RelanceTypingCard() {
  const [text, setText] = useState("");
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) {
      setText(TYPING_MESSAGE);
      return;
    }
    let i = 0;
    const tick = () => {
      setText(TYPING_MESSAGE.slice(0, i));
      i += 1;
      if (i <= TYPING_MESSAGE.length) {
        window.setTimeout(tick, 28);
      } else {
        window.setTimeout(() => {
          i = 0;
          setText("");
          window.setTimeout(tick, 800);
        }, 2400);
      }
    };
    tick();
    return () => undefined;
  }, [reduce]);

  return (
    <GlassCard strong className="p-5 sm:p-6">
      <div className="flex items-center justify-between gap-2 border-b border-[rgba(27,79,255,0.2)] pb-3">
        <p className="text-xs font-medium uppercase tracking-wider text-[#8BA3C7]">
          Relance IA
        </p>
        <span className="rounded-full bg-[rgba(27,79,255,0.2)] px-2 py-0.5 text-[10px] font-semibold text-[#3b7bff]">
          Pas revenu · 60j
        </span>
      </div>
      <p className="mt-2 text-sm font-medium text-[#EEF6FF]">Client — Marie D.</p>
      <p className="mt-3 min-h-[4.5rem] text-sm leading-relaxed text-[#8BA3C7]">
        {text}
        <span className="inline-block w-0.5 animate-pulse bg-[#3b7bff] align-middle" aria-hidden>
          &nbsp;
        </span>
      </p>
      <p className="mt-3 text-[10px] text-[#8BA3C7]">Vous validez avant envoi</p>
    </GlassCard>
  );
}

function GoogleReviewsCard() {
  const reduce = useReducedMotion();
  const [count, setCount] = useState(4.2);
  const [stars, setStars] = useState(0);

  useEffect(() => {
    if (reduce) {
      setStars(5);
      setCount(4.8);
      return;
    }
    let s = 0;
    const starInterval = window.setInterval(() => {
      s += 1;
      setStars(s);
      if (s >= 5) window.clearInterval(starInterval);
    }, 400);

    const countInterval = window.setInterval(() => {
      setCount((c) => {
        const next = Math.min(4.8, Math.round((c + 0.1) * 10) / 10);
        if (next >= 4.8) window.clearInterval(countInterval);
        return next;
      });
    }, 350);

    return () => {
      window.clearInterval(starInterval);
      window.clearInterval(countInterval);
    };
  }, [reduce]);

  return (
    <GlassCard className="p-5 sm:p-6">
      <p className="text-xs font-medium uppercase tracking-wider text-[#8BA3C7]">
        Avis Google
      </p>
      <div className="mt-3 flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 transition-colors ${
              i < stars ? "fill-[#1b4fff] text-[#3b7bff]" : "text-[rgba(27,79,255,0.25)]"
            }`}
            aria-hidden
          />
        ))}
      </div>
      <p className="zg-lp-display mt-2 text-2xl font-bold tabular-nums text-[#EEF6FF]">
        {count.toFixed(1)}
      </p>
      <p className="text-xs text-[#8BA3C7]">+24 avis ce mois</p>
    </GlassCard>
  );
}

function CampaignCascade() {
  const reduce = useReducedMotion();
  const campaigns = ["Menu du chef", "Soirée vendredi", "Bon retour"];

  return (
    <div className="space-y-2">
      {campaigns.map((name, i) => (
        <motion.div
          key={name}
          className="zg-lp-glass flex items-center gap-3 px-4 py-3"
          initial={{ opacity: 1, x: reduce ? 0 : -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 + i * 0.15, duration: 0.4 }}
        >
          <CalendarPlus className="h-4 w-4 shrink-0 text-[#3b7bff]" aria-hidden />
          <span className="text-sm text-[#EEF6FF]">{name}</span>
        </motion.div>
      ))}
    </div>
  );
}

export function AIConcreteSection() {
  return (
    <Section id="ia-concrete">
      <Container>
        <ScrollReveal>
          <SectionHeader
            title="L'IA travaille là où vous manquez de temps."
            subtitle="Elle prépare vos relances, vos campagnes et vos textes marketing. Vous gardez la main, vous validez, puis vous envoyez."
          />
        </ScrollReveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {USE_CASES.map((u, i) => (
            <ScrollReveal key={u.label} delay={i * 0.06}>
              <div className="zg-lp-glass flex h-full flex-col items-center p-4 text-center sm:p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(27,79,255,0.18)] text-[#3b7bff]">
                  <u.icon className="h-5 w-5" aria-hidden />
                </span>
                <p className="zg-lp-display mt-3 text-sm font-semibold text-[#EEF6FF]">
                  {u.label}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <ScrollReveal>
            <RelanceTypingCard />
          </ScrollReveal>
          <ScrollReveal delay={0.08}>
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[#8BA3C7]">
                Campagnes
              </p>
              <CampaignCascade />
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.16}>
            <GoogleReviewsCard />
          </ScrollReveal>
        </div>

        <ScrollReveal className="mt-10">
          <div className="zg-lp-glass zg-lp-glass--strong relative overflow-hidden bg-[rgba(27,79,255,0.12)] px-6 py-5 text-center sm:px-10 sm:py-6">
            <Sparkles className="mx-auto h-5 w-5 text-[#3b7bff]" aria-hidden />
            <p className="zg-lp-display mt-2 text-lg font-semibold text-[#EEF6FF] sm:text-xl">
              L&apos;IA propose. Vous gardez toujours le contrôle.
            </p>
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
