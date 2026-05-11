"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Calendar,
  Mail,
  Settings,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useId, type ReactNode } from "react";

const BAR_HEIGHTS = [40, 55, 38, 62, 48, 70, 45];
const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const sidebarItems: { icon: LucideIcon; label: string; active?: boolean }[] = [
  { icon: Calendar, label: "Réservations", active: true },
  { icon: Users, label: "Clients" },
  { icon: Star, label: "Avis" },
  { icon: Mail, label: "Campagnes" },
  { icon: BarChart3, label: "Statistiques" },
  { icon: Settings, label: "Paramètres" },
];

const statCards = [
  {
    label: "Réservations aujourd'hui",
    value: "24",
    trend: "↑ +12% vs hier",
    trendClass: "text-emerald-400/90",
  },
  {
    label: "Nouveaux clients",
    value: "8",
    trend: "↑ +3 cette semaine",
    trendClass: "text-emerald-400/90",
  },
  {
    label: "Note Google",
    value: "★ 4.7",
    trend: "234 avis",
    trendClass: "text-landing-muted",
  },
  {
    label: "Campagne envoyée",
    value: "234",
    trend: "destinataires",
    trendClass: "text-landing-muted",
  },
];

type FloatFeature = {
  icon: LucideIcon;
  title: string;
  description: string;
  desktopClass: string;
  rotateY: number;
  rotateZ: number;
  floatDuration: number;
  floatDelay: number;
};

const floatFeatures: FloatFeature[] = [
  {
    icon: Calendar,
    title: "Réservations centralisées",
    description: "Calendrier + vue table en temps réel.",
    desktopClass: "top-[5%] left-0",
    rotateY: 15,
    rotateZ: -2,
    floatDuration: 5.2,
    floatDelay: 0,
  },
  {
    icon: Users,
    title: "CRM automatique",
    description: "Chaque résa enrichit ta base clients.",
    desktopClass: "top-[8%] right-0",
    rotateY: -15,
    rotateZ: 2,
    floatDuration: 4.4,
    floatDelay: 0.4,
  },
  {
    icon: Star,
    title: "Avis Google auto",
    description: "Email post-visite envoyé tout seul.",
    desktopClass: "bottom-[15%] left-[3%]",
    rotateY: 15,
    rotateZ: -2,
    floatDuration: 5.8,
    floatDelay: 0.2,
  },
  {
    icon: Mail,
    title: "Campagnes en 2 clics",
    description: "Relance, événements, fidélisation.",
    desktopClass: "bottom-[12%] right-[2%]",
    rotateY: -15,
    rotateZ: 2,
    floatDuration: 4.7,
    floatDelay: 0.6,
  },
];

function DashboardFrame({ compactSidebar }: { compactSidebar?: boolean }) {
  const chartGradId = `zg-chart-${useId().replace(/:/g, "")}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-landing-border bg-landing-card shadow-[0_0_0_1px_rgba(255,107,44,0.06)_inset]">
      <div className="flex h-9 items-center gap-2 border-b border-landing-border bg-[#0f0c0a] px-3 sm:h-10">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57] sm:size-3" />
          <span className="size-2.5 rounded-full bg-[#febc2e] sm:size-3" />
          <span className="size-2.5 rounded-full bg-[#28c840] sm:size-3" />
        </div>
        <div className="flex min-w-0 flex-1 justify-center">
          <span className="truncate rounded-full border border-landing-border/70 bg-landing-card/80 px-2.5 py-0.5 text-[10px] text-landing-muted sm:text-[11px]">
            app.zengrow.ch/dashboard
          </span>
        </div>
        <div className="w-10 shrink-0" aria-hidden />
      </div>

      <div className="flex min-h-[280px] bg-[#0c0a08] sm:min-h-[320px]">
        <aside
          className={`shrink-0 border-r border-landing-border bg-[#0f0c0a] py-4 ${
            compactSidebar ? "w-[148px] px-2 sm:w-[180px] sm:px-3" : "w-[200px] px-3"
          }`}
        >
          <div className="font-landing-serif text-base italic text-landing-fg sm:text-lg">ZenGrow</div>
          <nav className="mt-5 space-y-0.5">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className={
                    item.active
                      ? "flex items-center gap-2 rounded-lg bg-landing-accent/10 px-2 py-2 text-sm font-medium text-landing-accent"
                      : "flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-landing-muted transition hover:bg-landing-card/60 hover:text-landing-fg"
                  }
                >
                  <Icon className="size-4 shrink-0 opacity-90" strokeWidth={1.5} aria-hidden />
                  <span className="truncate">{item.label}</span>
                </div>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 overflow-hidden p-3 sm:p-4">
          <h2 className="text-base font-semibold text-landing-fg sm:text-xl">Tableau de bord</h2>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-4">
            {statCards.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-landing-border bg-landing-card/80 p-2.5 sm:p-3.5"
              >
                <p className="text-[10px] text-landing-muted sm:text-xs">{s.label}</p>
                <p className="mt-1 font-landing-serif text-lg text-landing-fg sm:text-2xl">{s.value}</p>
                <p className={`mt-0.5 text-[10px] sm:text-xs ${s.trendClass}`}>{s.trend}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-landing-border bg-landing-card/60 p-3 sm:p-4">
            <p className="text-xs font-medium text-landing-fg sm:text-sm">Réservations sur 7 jours</p>
            <svg
              className="mt-3 h-16 w-full sm:h-20"
              viewBox="0 0 140 56"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden
            >
              <defs>
                <linearGradient id={chartGradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF6B2C" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#FF6B2C" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              {BAR_HEIGHTS.map((h, i) => {
                const w = 12;
                const gap = 6;
                const x = 8 + i * (w + gap);
                const y = 48 - (h / 100) * 40;
                const height = (h / 100) * 40;
                return <rect key={DAY_LABELS[i]} x={x} y={y} width={w} height={height} rx={2} fill={`url(#${chartGradId})`} />;
              })}
            </svg>
            <div className="mt-1 flex justify-between text-[9px] text-landing-muted sm:text-[10px]">
              {DAY_LABELS.map((d) => (
                <span key={d} className="w-8 text-center sm:w-10">
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureMiniCard({
  item,
  variant,
}: {
  item: FloatFeature;
  variant: "desktop" | "stack";
}) {
  const Icon = item.icon;
  const isDesktop = variant === "desktop";

  return (
    <motion.div
      className="w-full max-w-[240px] rounded-xl border border-landing-border bg-landing-card/90 p-4 shadow-[0_0_40px_-24px_rgba(255,107,44,0.35)] backdrop-blur-md"
      style={{ transformStyle: "preserve-3d" }}
      initial={false}
      animate={
        isDesktop
          ? {
              y: [0, -8, 0],
              rotateY: item.rotateY,
              rotateZ: item.rotateZ,
            }
          : { y: [0, -6, 0], rotateY: 0, rotateZ: 0 }
      }
      transition={{
        y: {
          duration: item.floatDuration,
          repeat: Infinity,
          ease: "easeInOut",
          delay: item.floatDelay,
        },
        rotateY: { duration: 0.35 },
        rotateZ: { duration: 0.35 },
      }}
      whileHover={{
        scale: 1.05,
        rotateY: 0,
        rotateZ: 0,
        boxShadow: "0 0 48px -8px rgba(255, 107, 44, 0.55)",
        transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
      }}
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-landing-accent/30 bg-landing-accent/10 text-landing-accent">
        <Icon className="size-4" strokeWidth={1.5} aria-hidden />
      </div>
      <h3 className="mt-3 text-sm font-medium text-landing-fg">{item.title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-landing-muted">{item.description}</p>
    </motion.div>
  );
}

function MockupShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative mx-auto w-full max-w-[900px] [perspective:1500px]"
      style={{ filter: "drop-shadow(0 26px 52px rgba(255, 107, 44, 0.36))" }}
    >
      <motion.div
        className="will-change-transform"
        animate={{ y: [-5, 5, -5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          className="origin-center"
          style={{
            transform: "perspective(1500px) rotateX(5deg) rotateY(-3deg)",
          }}
        >
          {children}
        </div>
      </motion.div>
    </div>
  );
}

export function DashboardMockup() {
  return (
    <div className="relative mx-auto min-h-[700px] max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div
        className="pointer-events-none absolute left-1/2 top-[42%] h-[min(480px,55vh)] w-[min(920px,92%)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-landing-accent/[0.25] blur-[100px]"
        aria-hidden
      />

      {/* Desktop : mockup centré + cards en absolute */}
      <div className="relative hidden min-h-[640px] lg:block">
        {floatFeatures.map((item) => (
          <div
            key={item.title}
            className={`pointer-events-auto absolute z-30 w-[240px] max-w-[calc(100%-1rem)] sm:max-w-[240px] ${item.desktopClass}`}
          >
            <FeatureMiniCard item={item} variant="desktop" />
          </div>
        ))}
        <div className="relative z-10 mx-auto w-full max-w-[900px] px-2 pt-16 pb-24">
          <MockupShell>
            <DashboardFrame />
          </MockupShell>
        </div>
      </div>

      {/* Tablette : 2 cartes sur les côtés + mockup + 2 en dessous */}
      <div className="relative z-10 mx-auto hidden max-w-4xl flex-col gap-8 md:flex lg:hidden">
        <div className="flex items-start justify-center gap-3">
          <div className="hidden w-[200px] shrink-0 pt-4 sm:block">
            <FeatureMiniCard item={floatFeatures[0]} variant="stack" />
          </div>
          <div className="min-w-0 flex-1">
            <MockupShell>
              <DashboardFrame compactSidebar />
            </MockupShell>
          </div>
          <div className="hidden w-[200px] shrink-0 pt-4 sm:block">
            <FeatureMiniCard item={floatFeatures[1]} variant="stack" />
          </div>
        </div>
        <div className="mx-auto grid w-full max-w-xl grid-cols-2 gap-4 px-2">
          <FeatureMiniCard item={floatFeatures[2]} variant="stack" />
          <FeatureMiniCard item={floatFeatures[3]} variant="stack" />
        </div>
      </div>

      {/* Mobile : mockup puis grille 2x2 */}
      <div className="relative z-10 flex flex-col gap-6 md:hidden">
        <MockupShell>
          <DashboardFrame compactSidebar />
        </MockupShell>
        <div className="mx-auto grid w-full max-w-md grid-cols-2 gap-3">
          {floatFeatures.map((item) => (
            <FeatureMiniCard key={item.title} item={item} variant="stack" />
          ))}
        </div>
      </div>
    </div>
  );
}
