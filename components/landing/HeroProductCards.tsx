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

const cardMotion = (delay: number, y = 6) => ({
  animate: { y: [0, -y, 0] },
  transition: { duration: 5.5 + delay * 0.4, repeat: Infinity, ease: "easeInOut" as const, delay },
  whileHover: {
    y: -4,
    scale: 1.02,
    transition: { duration: 0.35 },
  },
});

function ProductCardShell({
  children,
  className,
  featured,
  glowPulse,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  featured?: boolean;
  glowPulse?: boolean;
  delay?: number;
}) {
  return (
    <motion.article
      {...cardMotion(delay, featured ? 8 : 5)}
      className={cn(
        "group relative min-h-[220px] overflow-hidden rounded-[1.35rem] border border-[rgba(255,122,61,0.14)] p-[1px] sm:min-h-[240px] sm:rounded-[1.5rem]",
        featured && "border-[rgba(255,122,61,0.28)]",
        className,
      )}
    >
      {glowPulse ? (
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255, 90, 42, 0.35), transparent 70%)",
          }}
          animate={{ opacity: [0.35, 0.65, 0.35] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        />
      ) : null}
      <div
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-[inherit] bg-[rgba(10,7,5,0.72)] p-4 shadow-[0_28px_80px_-32px_rgba(0,0,0,0.9)] backdrop-blur-2xl transition duration-500 sm:p-4",
          "before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-gradient-to-br before:from-[rgba(255,255,255,0.06)] before:via-transparent before:to-transparent before:opacity-80",
          "after:pointer-events-none after:absolute after:inset-x-0 after:top-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-[rgba(255,122,61,0.45)] after:to-transparent",
          "group-hover:border-[rgba(255,122,61,0.32)] group-hover:shadow-[0_0_48px_-8px_rgba(255,90,42,0.35)]",
        )}
      >
        <div className="relative z-10 flex flex-1 flex-col">{children}</div>
      </div>
    </motion.article>
  );
}

function InactiveClientsCard() {
  return (
    <ProductCardShell delay={0} glowPulse>
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(255,122,61,0.2)] bg-[rgba(255,90,42,0.1)] px-2 py-1 text-[10px] font-medium text-[#F6A85A]">
          <Zap className="size-3" />
          Détection IA
        </span>
        <span className="text-[10px] text-[#AFA39A]">Live</span>
      </div>

      <p className="mt-3 text-sm font-semibold leading-snug text-[#FFF7EF]">
        42 clients absents depuis 60 jours
      </p>
      <p className="mt-1 text-[11px] text-[#AFA39A]">ZenGrow a identifié vos clients inactifs.</p>

      <div className="relative mt-4 flex-1">
        <div className="absolute -right-2 -top-1 z-0 w-[78%] rounded-xl border border-[rgba(255,255,255,0.04)] bg-[rgba(0,0,0,0.45)] p-2.5 opacity-70 blur-[0.5px]">
          <div className="flex gap-1.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 flex-1 rounded-md bg-[rgba(255,255,255,0.05)]" />
            ))}
          </div>
        </div>
        <div className="relative z-10 rounded-xl border border-[rgba(255,122,61,0.15)] bg-[rgba(0,0,0,0.5)] p-3">
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#AFA39A]">Clients détectés</p>
              <p className="font-landing-serif text-2xl leading-none text-[#FF7A3D]">42</p>
            </div>
            <Users className="size-5 text-[rgba(255,122,61,0.5)]" />
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#FF5A2A] to-[#F6A85A]"
              initial={{ width: "0%" }}
              whileInView={{ width: "78%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <p className="mt-1.5 text-[10px] text-[#AFA39A]">+60 jours sans visite</p>
        </div>
      </div>

      <button
        type="button"
        className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-[rgba(255,122,61,0.25)] bg-gradient-to-r from-[rgba(255,90,42,0.2)] to-[rgba(255,90,42,0.08)] px-3 py-2.5 text-xs font-semibold text-[#FF7A3D] shadow-[0_0_24px_-6px_rgba(255,90,42,0.5)] transition hover:from-[rgba(255,90,42,0.3)] hover:to-[rgba(255,90,42,0.12)]"
      >
        <Sparkles className="size-3.5" />
        Créer une campagne IA
      </button>
    </ProductCardShell>
  );
}

function ReservationCard() {
  return (
    <ProductCardShell delay={0.35} featured glowPulse>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wider text-[#AFA39A]">
          Notification
        </span>
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/40" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-400/90" />
        </span>
      </div>

      <p className="mt-2 text-sm font-semibold text-[#FFF7EF]">Nouvelle réservation</p>

      <div className="relative mt-3 flex-1">
        <motion.div
          className="absolute -left-1 top-2 z-0 w-[88%] rounded-2xl border border-[rgba(255,122,61,0.08)] bg-[rgba(26,16,10,0.8)] p-3 opacity-60"
          animate={{ y: [0, 3, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <div className="h-8 rounded-lg bg-[rgba(255,255,255,0.04)]" />
        </motion.div>
        <div className="relative z-10 rounded-2xl border border-[rgba(255,122,61,0.22)] bg-gradient-to-br from-[rgba(255,90,42,0.12)] to-[rgba(0,0,0,0.4)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[rgba(255,122,61,0.25)] bg-[rgba(255,90,42,0.15)]">
              <Calendar className="size-4 text-[#FF7A3D]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-[#FFF7EF]">Samedi · 20:00</p>
              <p className="text-[11px] text-[#AFA39A]">4 personnes</p>
            </div>
            <span className="shrink-0 rounded-full bg-[rgba(34,197,94,0.18)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-300">
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
    <ProductCardShell delay={0.7}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-[#FFF7EF]">Campagne prête à envoyer</p>
        <span className="shrink-0 rounded-full border border-[rgba(255,122,61,0.25)] bg-[rgba(255,90,42,0.12)] px-2 py-0.5 text-[9px] font-semibold text-[#F6A85A]">
          Générée par l&apos;IA
        </span>
      </div>

      <div className="relative mt-3 flex-1 space-y-2">
        <div className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.35)] px-2.5 py-2">
          <p className="text-[10px] text-[#AFA39A]">Objet</p>
          <p className="mt-0.5 truncate text-[11px] font-medium text-[#FFF7EF]">
            Revenez découvrir notre carte…
          </p>
        </div>
        <div className="rounded-xl border border-[rgba(255,122,61,0.12)] bg-[rgba(0,0,0,0.45)] p-2.5">
          <div className="mb-2 flex items-center gap-1.5">
            <Mail className="size-3 text-[#FF7A3D]" />
            <span className="text-[10px] text-[#AFA39A]">Aperçu message</span>
          </div>
          <p className="text-[11px] leading-relaxed text-[#AFA39A]">
            Revenez découvrir notre nouvelle carte cette semaine.
          </p>
        </div>
        <motion.div
          className="absolute -right-1 bottom-8 z-20 rounded-lg border border-[rgba(255,122,61,0.2)] bg-[rgba(26,16,10,0.95)] px-2 py-1.5 shadow-lg backdrop-blur-md"
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="flex items-center gap-1 text-[10px] font-medium text-[#FF7A3D]">
            <Sparkles className="size-3" />
            IA
          </span>
        </motion.div>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          className="flex-1 rounded-lg border border-[rgba(255,255,255,0.08)] py-2 text-[10px] text-[#AFA39A] transition hover:border-[rgba(255,122,61,0.2)]"
        >
          Modifier
        </button>
        <button
          type="button"
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-[#FF5A2A] py-2 text-[10px] font-semibold text-white shadow-[0_0_20px_-4px_rgba(255,90,42,0.8)] transition hover:bg-[#FF7A3D]"
        >
          <Send className="size-3" />
          Envoyer
        </button>
      </div>
    </ProductCardShell>
  );
}

function ReviewsCard() {
  return (
    <ProductCardShell delay={1.05}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-[#FFF7EF]">Avis Google automatisé</p>
          <p className="mt-1 text-[11px] text-[#AFA39A]">12 clients satisfaits à relancer</p>
        </div>
        <span className="rounded-full bg-[rgba(255,90,42,0.15)] px-2 py-0.5 text-[9px] font-bold uppercase text-[#FF7A3D]">
          Prêt
        </span>
      </div>

      <div className="relative mt-4 flex-1 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.4)] p-3">
        <div className="flex items-center justify-between">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={cn("size-3.5", i <= 4 ? "fill-[#F6A85A] text-[#F6A85A]" : "text-[rgba(255,255,255,0.15)]")}
              />
            ))}
          </div>
          <span className="text-[10px] text-[#AFA39A]">4.8</span>
        </div>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-[10px] text-[#AFA39A]">
            <span>Relances programmées</span>
            <span className="font-medium text-[#FFF7EF]">12</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#FF5A2A] via-[#F6A85A] to-[#FF7A3D]"
              animate={{ width: ["55%", "72%", "55%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-[rgba(255,122,61,0.12)] bg-[rgba(255,90,42,0.06)] px-2 py-1.5">
          <div className="size-6 rounded-full bg-gradient-to-br from-[rgba(255,90,42,0.35)] to-transparent" />
          <span className="text-[10px] text-[#AFA39A]">Demande après visite validée</span>
          <ChevronRight className="ml-auto size-3 text-[#FF7A3D]" />
        </div>
      </div>
    </ProductCardShell>
  );
}

export function HeroProductCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-5">
      <InactiveClientsCard />
      <ReservationCard />
      <CampaignCard />
      <ReviewsCard />
    </div>
  );
}
