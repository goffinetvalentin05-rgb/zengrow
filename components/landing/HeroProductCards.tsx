"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  ChevronRight,
  Mail,
  Send,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

type ShellProps = {
  children: React.ReactNode;
  className?: string;
  featured?: boolean;
  glowPulse?: boolean;
  delay?: number;
  floatY?: number;
};

function ProductCardShell({
  children,
  className,
  featured,
  glowPulse,
  delay = 0,
  floatY = 5,
}: ShellProps) {
  return (
    <motion.article
      className={cn(
        "group relative h-full overflow-hidden rounded-[1.35rem] border border-[rgba(255,122,61,0.14)] p-[1px] shadow-[0_28px_80px_-32px_rgba(0,0,0,0.92)] sm:rounded-[1.5rem]",
        featured && "border-[rgba(255,122,61,0.28)]",
        className,
      )}
      animate={{ y: [0, -floatY, 0] }}
      transition={{ duration: 5.5 + delay * 0.35, repeat: Infinity, ease: "easeInOut", delay }}
      whileHover={{ y: -5, scale: 1.015, transition: { duration: 0.3 } }}
    >
      {glowPulse ? (
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-[inherit]"
          style={{
            background:
              "radial-gradient(ellipse 80% 55% at 50% 0%, rgba(255, 90, 42, 0.38), transparent 70%)",
          }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        />
      ) : null}
      <div
        className={cn(
          "relative flex h-full min-h-0 flex-col overflow-hidden rounded-[inherit] bg-[rgba(10,7,5,0.78)] p-3.5 backdrop-blur-2xl sm:p-4",
          "before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-gradient-to-br before:from-[rgba(255,255,255,0.07)] before:via-transparent before:to-transparent",
          "after:pointer-events-none after:absolute after:inset-x-0 after:top-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-[rgba(255,122,61,0.45)] after:to-transparent",
        )}
      >
        <div className="relative z-10 flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </motion.article>
  );
}

function InactiveClientsCard() {
  return (
    <ProductCardShell delay={0} glowPulse floatY={6} className="h-full">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(255,122,61,0.2)] bg-[rgba(255,90,42,0.1)] px-2 py-1 text-[10px] font-medium text-[#F6A85A]">
          <Zap className="size-3" />
          Détection IA
        </span>
        <span className="text-[10px] text-[#AFA39A]">Live</span>
      </div>
      <p className="mt-2.5 font-landing-serif text-base leading-snug text-[#FFF7EF] sm:text-lg">
        42 clients absents depuis 60 jours
      </p>
      <p className="mt-1 text-[11px] text-[#AFA39A]">ZenGrow a identifié vos clients inactifs.</p>
      <div className="relative mt-3 flex-1">
        <div className="relative z-10 rounded-xl border border-[rgba(255,122,61,0.18)] bg-[rgba(0,0,0,0.5)] p-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#AFA39A]">Clients détectés</p>
              <p className="font-landing-serif text-3xl leading-none text-[#FF7A3D]">42</p>
            </div>
            <Users className="size-5 text-[rgba(255,122,61,0.45)]" />
          </div>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/5">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#FF5A2A] to-[#F6A85A]"
              initial={{ width: "0%" }}
              whileInView={{ width: "82%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.1 }}
            />
          </div>
        </div>
      </div>
      <button
        type="button"
        className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-[rgba(255,122,61,0.25)] bg-gradient-to-r from-[rgba(255,90,42,0.2)] to-[rgba(255,90,42,0.06)] py-2 text-xs font-semibold text-[#FF7A3D]"
      >
        <Sparkles className="size-3.5" />
        Créer une campagne IA
      </button>
    </ProductCardShell>
  );
}

function ReservationCard() {
  return (
    <ProductCardShell delay={0.3} featured glowPulse floatY={7} className="h-full">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wider text-[#AFA39A]">Notification</span>
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/35" />
          <span className="relative size-2 rounded-full bg-emerald-400/90" />
        </span>
      </div>
      <p className="mt-1.5 text-sm font-semibold text-[#FFF7EF]">Nouvelle réservation</p>
      <div className="mt-2 flex-1 rounded-2xl border border-[rgba(255,122,61,0.22)] bg-gradient-to-br from-[rgba(255,90,42,0.12)] to-[rgba(0,0,0,0.4)] p-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-full border border-[rgba(255,122,61,0.3)] bg-[rgba(255,90,42,0.15)]">
            <Calendar className="size-4 text-[#FF7A3D]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-[#FFF7EF]">Samedi · 20:00</p>
            <p className="text-[10px] text-[#AFA39A]">4 personnes</p>
          </div>
          <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[8px] font-bold uppercase text-emerald-300">
            Confirmée
          </span>
        </div>
      </div>
    </ProductCardShell>
  );
}

function CampaignCard() {
  return (
    <ProductCardShell delay={0.55} floatY={5} className="h-full">
      <p className="text-sm font-semibold text-[#FFF7EF]">Campagne prête à envoyer</p>
      <p className="text-[10px] text-[#F6A85A]">Générée par l&apos;IA</p>
      <div className="mt-2 flex-1 space-y-2">
        <div className="rounded-lg border border-white/5 bg-black/40 px-2 py-1.5">
          <p className="text-[9px] text-[#AFA39A]">Objet</p>
          <p className="truncate text-[10px] font-medium text-[#FFF7EF]">Revenez découvrir notre carte…</p>
        </div>
        <div className="rounded-xl border border-[rgba(255,122,61,0.12)] bg-black/45 p-2">
          <Mail className="mb-1 size-3 text-[#FF7A3D]" />
          <p className="text-[10px] leading-relaxed text-[#AFA39A]">
            Revenez découvrir notre nouvelle carte cette semaine.
          </p>
        </div>
      </div>
      <div className="mt-2 flex gap-1.5">
        <button type="button" className="flex-1 rounded-lg border border-white/8 py-1.5 text-[9px] text-[#AFA39A]">
          Modifier
        </button>
        <button
          type="button"
          className="inline-flex flex-1 items-center justify-center gap-0.5 rounded-lg bg-[#FF5A2A] py-1.5 text-[9px] font-semibold text-white"
        >
          <Send className="size-2.5" />
          Envoyer
        </button>
      </div>
    </ProductCardShell>
  );
}

function ReviewsCard() {
  return (
    <ProductCardShell delay={0.8} floatY={4} className="h-full">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-[#FFF7EF]">Avis Google automatisé</p>
        <span className="rounded-full bg-[rgba(255,90,42,0.15)] px-2 py-0.5 text-[8px] font-bold uppercase text-[#FF7A3D]">
          Prêt
        </span>
      </div>
      <p className="text-[10px] text-[#AFA39A]">12 clients satisfaits à relancer</p>
      <div className="mt-2 flex-1 rounded-xl border border-white/5 bg-black/40 p-2.5">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className={cn("size-3", i <= 4 ? "fill-[#F6A85A] text-[#F6A85A]" : "text-white/10")} />
          ))}
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/5">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#FF5A2A] to-[#F6A85A]"
            animate={{ width: ["52%", "70%", "52%"] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
        </div>
        <div className="mt-2 flex items-center gap-1 text-[9px] text-[#AFA39A]">
          Workflow actif
          <ChevronRight className="size-3 text-[#FF7A3D]" />
        </div>
      </div>
    </ProductCardShell>
  );
}

/**
 * Desktop : grille maîtrisée (4 cartes visibles) + légers décalages pour l’effet flottant.
 */
function FloatingComposition() {
  return (
    <div className="relative mx-auto hidden w-full max-w-5xl md:block">
      <div
        className="pointer-events-none absolute inset-x-[8%] top-[12%] bottom-[8%] rounded-[2.5rem] bg-[radial-gradient(ellipse_at_50%_50%,rgba(255,90,42,0.08),transparent_72%)]"
        aria-hidden
      />

      <div className="grid min-h-[440px] max-h-[min(520px,58vh)] grid-cols-12 grid-rows-6 gap-3 lg:min-h-[480px] lg:gap-4">
        {/* Carte principale — analytics */}
        <div className="col-span-6 row-span-4 row-start-1 col-start-1 z-10 lg:col-span-5">
          <InactiveClientsCard />
        </div>

        {/* Notification réservation — haut droite */}
        <div className="col-span-6 row-span-3 row-start-1 col-start-7 z-30 lg:col-span-4 lg:col-start-8">
          <div className="h-full lg:translate-x-1 lg:-translate-y-1">
            <ReservationCard />
          </div>
        </div>

        {/* Campagne — bas droite */}
        <div className="col-span-6 row-span-3 row-start-4 col-start-7 z-20 lg:col-span-5 lg:col-start-7">
          <div className="h-full lg:translate-y-1">
            <CampaignCard />
          </div>
        </div>

        {/* Accent avis — bas centre-gauche */}
        <div className="col-span-5 row-span-2 row-start-5 col-start-2 z-40 lg:col-span-4 lg:col-start-3">
          <div className="h-full max-w-sm lg:-translate-y-2 lg:scale-[0.97]">
            <ReviewsCard />
          </div>
        </div>
      </div>
    </div>
  );
}

function StackedComposition() {
  return (
    <div className="relative flex flex-col gap-3 md:hidden">
      <InactiveClientsCard />
      <div className="-mt-4 ml-6 max-w-[94%] self-end">
        <ReservationCard />
      </div>
      <div className="-mt-3 max-w-[96%]">
        <CampaignCard />
      </div>
      <div className="-mt-4 ml-3 max-w-[90%]">
        <ReviewsCard />
      </div>
    </div>
  );
}

export function HeroProductCards() {
  return (
    <>
      <FloatingComposition />
      <StackedComposition />
    </>
  );
}
