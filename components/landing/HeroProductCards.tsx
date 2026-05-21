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
  rotate?: number;
};

function ProductCardShell({
  children,
  className,
  featured,
  glowPulse,
  delay = 0,
  floatY = 6,
  rotate = 0,
}: ShellProps) {
  return (
    <motion.div
      className={cn("relative w-full", className)}
      style={{ rotate }}
      animate={{
        y: [0, -floatY, 0],
        rotate: [rotate, rotate + 0.5, rotate - 0.35, rotate],
      }}
      transition={{
        y: { duration: 5.2 + delay * 0.3, repeat: Infinity, ease: "easeInOut", delay },
        rotate: { duration: 9 + delay, repeat: Infinity, ease: "easeInOut", delay: delay * 0.5 },
      }}
      whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.35 } }}
    >
      {/* Halo orange derrière la carte */}
      <motion.div
        className="pointer-events-none absolute -inset-3 rounded-[1.75rem] bg-[radial-gradient(ellipse_at_50%_80%,rgba(255,90,42,0.18),transparent_72%)] blur-xl"
        animate={{ opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 4.5 + delay, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />
      <article
        className={cn(
          "group relative overflow-hidden rounded-2xl border border-[rgba(255,122,61,0.16)] p-[1px] shadow-[0_32px_90px_-28px_rgba(0,0,0,0.92)]",
          featured && "border-[rgba(255,122,61,0.32)] shadow-[0_0_48px_-12px_rgba(255,90,42,0.35)]",
        )}
      >
        {glowPulse ? (
          <motion.div
            className="pointer-events-none absolute -inset-px rounded-[inherit]"
            style={{
              background:
                "radial-gradient(ellipse 90% 70% at 50% 0%, rgba(255, 90, 42, 0.45), transparent 72%)",
            }}
            animate={{ opacity: [0.25, 0.55, 0.25] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden
          />
        ) : null}
        <div className="relative overflow-hidden rounded-[inherit] bg-[rgba(8,5,4,0.82)] p-3.5 backdrop-blur-2xl sm:p-4">
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-white/[0.07] via-transparent to-transparent" />
          <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,122,61,0.5)] to-transparent" />
          <div className="relative z-10">{children}</div>
        </div>
      </article>
    </motion.div>
  );
}

function InactiveClientsCard({ compact }: { compact?: boolean }) {
  return (
    <ProductCardShell delay={0} glowPulse rotate={-2.5} floatY={8}>
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 rounded-lg border border-[rgba(255,122,61,0.22)] bg-[rgba(255,90,42,0.12)] px-2 py-0.5 text-[10px] font-medium text-[#F6A85A]">
          <Zap className="size-3" />
          Détection IA
        </span>
        {!compact ? <span className="text-[10px] text-[#AFA39A]">Live</span> : null}
      </div>
      <p className="mt-2 font-landing-serif text-[15px] leading-snug text-[#FFF7EF] sm:text-base">
        42 clients absents depuis 60 jours
      </p>
      <p className="mt-0.5 text-[10px] text-[#AFA39A]">ZenGrow a identifié vos clients inactifs.</p>
      <div className="mt-3 rounded-xl border border-[rgba(255,122,61,0.2)] bg-black/50 p-2.5">
        <div className="flex items-end justify-between">
          <p className="font-landing-serif text-2xl text-[#FF7A3D]">42</p>
          <Users className="size-4 text-[rgba(255,122,61,0.5)]" />
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#FF5A2A] to-[#F6A85A]"
            initial={{ width: 0 }}
            whileInView={{ width: "85%" }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>
      <button
        type="button"
        className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-[rgba(255,90,42,0.25)] to-[rgba(255,90,42,0.08)] py-2 text-[11px] font-semibold text-[#FF7A3D]"
      >
        <Sparkles className="size-3" />
        Créer une campagne IA
      </button>
    </ProductCardShell>
  );
}

function ReservationCard() {
  return (
    <ProductCardShell delay={0.35} featured glowPulse rotate={3} floatY={9}>
      <p className="text-[9px] font-medium uppercase tracking-wider text-[#AFA39A]">Notification</p>
      <p className="mt-1 text-sm font-semibold text-[#FFF7EF]">Nouvelle réservation</p>
      <div className="mt-2 rounded-xl border border-[rgba(255,122,61,0.25)] bg-gradient-to-br from-[rgba(255,90,42,0.15)] to-black/50 p-2">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-[rgba(255,90,42,0.2)]">
            <Calendar className="size-3.5 text-[#FF7A3D]" />
          </div>
          <div className="min-w-0 flex-1 text-[11px]">
            <p className="font-medium text-[#FFF7EF]">Samedi · 20:00</p>
            <p className="text-[#AFA39A]">4 personnes</p>
          </div>
          <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[7px] font-bold uppercase text-emerald-300">
            Confirmée
          </span>
        </div>
      </div>
    </ProductCardShell>
  );
}

function CampaignCard() {
  return (
    <ProductCardShell delay={0.6} rotate={-1.8} floatY={7}>
      <p className="text-xs font-semibold text-[#FFF7EF]">Campagne prête à envoyer</p>
      <p className="text-[9px] text-[#F6A85A]">Générée par l&apos;IA</p>
      <div className="mt-2 rounded-lg border border-white/5 bg-black/45 p-2 text-[10px] leading-relaxed text-[#AFA39A]">
        Revenez découvrir notre nouvelle carte cette semaine.
      </div>
      <div className="mt-2 flex gap-1">
        <span className="flex flex-1 items-center justify-center gap-0.5 rounded-md border border-white/10 py-1 text-[9px] text-[#AFA39A]">
          <Mail className="size-2.5" />
          Modifier
        </span>
        <span className="flex flex-1 items-center justify-center gap-0.5 rounded-md bg-[#FF5A2A] py-1 text-[9px] font-semibold text-white">
          <Send className="size-2.5" />
          Envoyer
        </span>
      </div>
    </ProductCardShell>
  );
}

function ReviewsCard() {
  return (
    <ProductCardShell delay={0.9} rotate={2} floatY={5} className="scale-[0.96]">
      <p className="text-xs font-semibold text-[#FFF7EF]">Avis Google automatisé</p>
      <p className="text-[9px] text-[#AFA39A]">12 clients à relancer</p>
      <div className="mt-2 flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={cn("size-3", i <= 4 ? "fill-[#F6A85A] text-[#F6A85A]" : "text-white/10")} />
        ))}
      </div>
      <div className="mt-2 flex items-center gap-1 text-[9px] text-[#AFA39A]">
        Workflow actif <ChevronRight className="size-3 text-[#FF7A3D]" />
      </div>
    </ProductCardShell>
  );
}

type OrbitSlotProps = {
  children: React.ReactNode;
  className: string;
};

function OrbitSlot({ children, className }: OrbitSlotProps) {
  return (
    <div className={cn("pointer-events-auto absolute z-20 w-[min(100%,280px)] max-w-[300px]", className)}>
      {children}
    </div>
  );
}

/** Cartes autour du hero — desktop, safe zone centrale préservée */
export function HeroOrbitDesktop() {
  return (
    <div className="absolute inset-0 hidden lg:block">
      {/* Safe zone : repousse visuellement les cartes du centre */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 z-[5] h-[min(420px,48vh)] w-[min(560px,52%)] -translate-x-1/2 -translate-y-1/2 rounded-[3rem] bg-[radial-gradient(ellipse_at_center,rgba(5,4,3,0.92)_0%,rgba(5,4,3,0.55)_55%,transparent_78%)]"
        aria-hidden
      />

      <motion.div
        className="pointer-events-none absolute left-1/2 top-[46%] h-[min(560px,58vh)] w-[min(960px,92%)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,90,42,0.09),transparent_68%)] blur-2xl"
        animate={{ opacity: [0.45, 0.7, 0.45], scale: [1, 1.04, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />

      {/* Analytics — haut gauche, loin du centre */}
      <OrbitSlot className="left-0 top-[10%] z-[15] w-[min(290px,26vw)] xl:left-[1%] xl:top-[12%]">
        <InactiveClientsCard />
      </OrbitSlot>

      {/* Réservation — haut droite */}
      <OrbitSlot className="right-0 top-[8%] z-[28] w-[min(255px,23vw)] xl:right-[1%] xl:top-[10%]">
        <ReservationCard />
      </OrbitSlot>

      {/* Campagne — bas droite, sous la zone CTA */}
      <OrbitSlot className="right-[1%] bottom-[6%] z-[22] w-[min(265px,24vw)] xl:right-[2%] xl:bottom-[8%]">
        <CampaignCard />
      </OrbitSlot>

      {/* Avis — bas gauche, éloigné du centre (plus de chevauchement CTA) */}
      <OrbitSlot className="bottom-[5%] left-0 z-[32] w-[min(220px,20vw)] xl:bottom-[7%] xl:left-[1%]">
        <ReviewsCard />
      </OrbitSlot>
    </div>
  );
}

export function HeroOrbitMobile() {
  return (
    <div className="relative mt-14 flex flex-col gap-3 lg:hidden">
      <InactiveClientsCard compact />
      <div className="-mt-5 ml-auto w-[92%]">
        <ReservationCard />
      </div>
      <div className="-mt-4 w-[94%]">
        <CampaignCard />
      </div>
      <div className="-mt-5 ml-3 w-[88%]">
        <ReviewsCard />
      </div>
    </div>
  );
}

/** @deprecated Utiliser HeroOrbitDesktop + Hero intégré */
export function HeroProductCards() {
  return (
    <>
      <HeroOrbitDesktop />
      <HeroOrbitMobile />
    </>
  );
}
