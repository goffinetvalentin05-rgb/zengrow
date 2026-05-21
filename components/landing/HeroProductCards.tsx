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
  wrapperClassName?: string;
  featured?: boolean;
  glowPulse?: boolean;
  delay?: number;
  floatY?: number;
  rotate?: number;
};

function ProductCardShell({
  children,
  className,
  wrapperClassName,
  featured,
  glowPulse,
  delay = 0,
  floatY = 6,
  rotate = 0,
}: ShellProps) {
  return (
    <motion.div
      className={cn("relative", wrapperClassName)}
      style={{ rotate }}
      animate={{ y: [0, -floatY, 0] }}
      transition={{ duration: 5.5 + delay * 0.4, repeat: Infinity, ease: "easeInOut", delay }}
      whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.35 } }}
    >
      <article
        className={cn(
          "group relative overflow-hidden rounded-[1.35rem] border border-[rgba(255,122,61,0.14)] p-[1px] shadow-[0_32px_90px_-28px_rgba(0,0,0,0.92)] sm:rounded-[1.5rem]",
          featured && "border-[rgba(255,122,61,0.3)]",
          className,
        )}
      >
        {glowPulse ? (
          <motion.div
            className="pointer-events-none absolute -inset-px rounded-[inherit]"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255, 90, 42, 0.4), transparent 70%)",
            }}
            animate={{ opacity: [0.3, 0.65, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden
          />
        ) : null}
        <div
          className={cn(
            "relative flex h-full flex-col overflow-hidden rounded-[inherit] bg-[rgba(10,7,5,0.78)] p-4 backdrop-blur-2xl sm:p-4",
            "before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-gradient-to-br before:from-[rgba(255,255,255,0.07)] before:via-transparent before:to-transparent",
            "after:pointer-events-none after:absolute after:inset-x-0 after:top-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-[rgba(255,122,61,0.5)] after:to-transparent",
            "transition duration-500 group-hover:shadow-[0_0_56px_-10px_rgba(255,90,42,0.4)]",
          )}
        >
          <div className="relative z-10 flex flex-1 flex-col">{children}</div>
        </div>
      </article>
    </motion.div>
  );
}

function InactiveClientsCard({ compact }: { compact?: boolean }) {
  return (
    <ProductCardShell delay={0} glowPulse floatY={8} className={compact ? "min-h-[200px]" : "min-h-[260px]"}>
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(255,122,61,0.2)] bg-[rgba(255,90,42,0.1)] px-2 py-1 text-[10px] font-medium text-[#F6A85A]">
          <Zap className="size-3" />
          Détection IA
        </span>
        <span className="rounded-md bg-[rgba(255,90,42,0.12)] px-1.5 py-0.5 text-[9px] font-semibold text-[#FF7A3D]">
          Analytics
        </span>
      </div>
      <p className="mt-3 font-landing-serif text-base font-normal leading-snug text-[#FFF7EF] sm:text-lg">
        42 clients absents depuis 60 jours
      </p>
      <p className="mt-1 text-[11px] text-[#AFA39A]">ZenGrow a identifié vos clients inactifs.</p>
      <div className="relative mt-4 flex-1">
        <div className="absolute -right-3 -top-2 z-0 w-[82%] rounded-xl border border-[rgba(255,255,255,0.04)] bg-[rgba(0,0,0,0.5)] p-2 opacity-60">
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-7 flex-1 rounded-md bg-[rgba(255,255,255,0.04)]" />
            ))}
          </div>
        </div>
        <div className="relative z-10 rounded-xl border border-[rgba(255,122,61,0.18)] bg-[rgba(0,0,0,0.55)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#AFA39A]">Clients détectés</p>
              <p className="font-landing-serif text-3xl leading-none text-[#FF7A3D]">42</p>
            </div>
            <Users className="size-6 text-[rgba(255,122,61,0.45)]" />
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#FF5A2A] to-[#F6A85A]"
              initial={{ width: "0%" }}
              whileInView={{ width: "82%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      </div>
      <button
        type="button"
        className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-[rgba(255,122,61,0.28)] bg-gradient-to-r from-[rgba(255,90,42,0.22)] to-[rgba(255,90,42,0.06)] px-3 py-2.5 text-xs font-semibold text-[#FF7A3D] shadow-[0_0_28px_-6px_rgba(255,90,42,0.55)]"
      >
        <Sparkles className="size-3.5" />
        Créer une campagne IA
      </button>
    </ProductCardShell>
  );
}

function ReservationCard({ compact }: { compact?: boolean }) {
  return (
    <ProductCardShell delay={0.4} featured glowPulse floatY={10} rotate={1.5} className={compact ? "min-h-[168px]" : "min-h-[200px]"}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wider text-[#AFA39A]">Notification</span>
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/35" />
          <span className="relative size-2 rounded-full bg-emerald-400/90" />
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold text-[#FFF7EF]">Nouvelle réservation</p>
      <div className="relative mt-2 flex-1">
        <div className="relative z-10 rounded-2xl border border-[rgba(255,122,61,0.25)] bg-gradient-to-br from-[rgba(255,90,42,0.14)] to-[rgba(0,0,0,0.45)] p-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[rgba(255,122,61,0.3)] bg-[rgba(255,90,42,0.18)]">
              <Calendar className="size-4 text-[#FF7A3D]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-[#FFF7EF]">Samedi · 20:00</p>
              <p className="text-[10px] text-[#AFA39A]">4 personnes</p>
            </div>
            <span className="shrink-0 rounded-full bg-[rgba(34,197,94,0.18)] px-2 py-0.5 text-[8px] font-bold uppercase text-emerald-300">
              Confirmée
            </span>
          </div>
        </div>
      </div>
    </ProductCardShell>
  );
}

function CampaignCard() {
  return (
    <ProductCardShell delay={0.75} floatY={7} rotate={-1.2} className="min-h-[220px]">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-[#FFF7EF]">Campagne prête à envoyer</p>
        <span className="shrink-0 rounded-full border border-[rgba(255,122,61,0.25)] bg-[rgba(255,90,42,0.12)] px-2 py-0.5 text-[8px] font-semibold text-[#F6A85A]">
          IA
        </span>
      </div>
      <p className="mt-0.5 text-[10px] text-[#AFA39A]">Générée par l&apos;IA</p>
      <div className="relative mt-3 flex-1 space-y-2">
        <div className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.4)] px-2 py-1.5">
          <p className="text-[9px] text-[#AFA39A]">Objet</p>
          <p className="truncate text-[10px] font-medium text-[#FFF7EF]">Revenez découvrir notre carte…</p>
        </div>
        <div className="rounded-xl border border-[rgba(255,122,61,0.14)] bg-[rgba(0,0,0,0.45)] p-2">
          <Mail className="mb-1 size-3 text-[#FF7A3D]" />
          <p className="text-[10px] leading-relaxed text-[#AFA39A]">
            Revenez découvrir notre nouvelle carte cette semaine.
          </p>
        </div>
      </div>
      <div className="mt-2 flex gap-1.5">
        <button type="button" className="flex-1 rounded-lg border border-[rgba(255,255,255,0.08)] py-1.5 text-[9px] text-[#AFA39A]">
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

function ReviewsCard({ compact }: { compact?: boolean }) {
  return (
    <ProductCardShell delay={1.1} floatY={5} rotate={0.8} className={compact ? "min-h-[160px]" : "min-h-[190px]"}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-[#FFF7EF] sm:text-sm">Avis Google automatisé</p>
        <span className="rounded-full bg-[rgba(255,90,42,0.15)] px-2 py-0.5 text-[8px] font-bold uppercase text-[#FF7A3D]">
          Prêt
        </span>
      </div>
      <p className="text-[10px] text-[#AFA39A]">12 clients satisfaits à relancer</p>
      <div className="mt-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.42)] p-2.5">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className={cn("size-3", i <= 4 ? "fill-[#F6A85A] text-[#F6A85A]" : "text-white/10")} />
          ))}
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/5">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#FF5A2A] to-[#F6A85A]"
            animate={{ width: ["50%", "68%", "50%"] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[9px] text-[#AFA39A]">
          <span>Workflow actif</span>
          <ChevronRight className="size-3 text-[#FF7A3D]" />
        </div>
      </div>
    </ProductCardShell>
  );
}

/** Composition flottante asymétrique — desktop */
function FloatingComposition() {
  return (
    <div className="relative mx-auto hidden min-h-[min(540px,72vh)] w-full max-w-5xl md:block lg:min-h-[600px]">
      <div
        className="pointer-events-none absolute left-[18%] top-[42%] z-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,90,42,0.12),transparent_70%)] blur-2xl"
        aria-hidden
      />

      <div className="absolute left-0 top-[6%] z-20 w-[min(100%,420px)] lg:left-[1%] lg:w-[46%]">
        <InactiveClientsCard />
      </div>

      <div className="absolute right-0 top-0 z-40 w-[min(100%,300px)] lg:right-[0%] lg:w-[34%]">
        <ReservationCard />
      </div>

      <div className="absolute bottom-[6%] right-[2%] z-30 w-[min(100%,320px)] lg:right-[4%] lg:w-[36%]">
        <CampaignCard />
      </div>

      <div className="absolute bottom-0 left-[28%] z-50 w-[min(100%,260px)] lg:left-[34%] lg:w-[30%]">
        <ReviewsCard />
      </div>
    </div>
  );
}

/** Mobile : pile décalée, léger chevauchement */
function StackedComposition() {
  return (
    <div className="relative flex flex-col gap-3 md:hidden">
      <div className="relative z-10">
        <InactiveClientsCard compact />
      </div>
      <div className="relative z-30 -mt-6 ml-8 mr-0 max-w-[92%] self-end">
        <ReservationCard compact />
      </div>
      <div className="relative z-20 -mt-4 max-w-[94%]">
        <CampaignCard />
      </div>
      <div className="relative z-40 -mt-5 ml-4 max-w-[88%]">
        <ReviewsCard compact />
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
