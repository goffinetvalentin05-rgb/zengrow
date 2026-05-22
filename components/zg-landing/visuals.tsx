import { cn } from "@/src/lib/utils";

export function MiniChip({
  children,
  active,
  className,
}: {
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-semibold",
        active
          ? "bg-violet-500/30 text-violet-100"
          : "bg-white/5 text-[#9b8fb8]",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function MiniProgress({ value = 72 }: { value?: number }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
      <div
        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export function MiniCalendar() {
  const days = ["L", "M", "M", "J", "V", "S", "D"];
  return (
    <div className="zg-mini-ui rounded-xl p-3">
      <div className="mb-2 flex items-center justify-between text-[10px] text-[#9b8fb8]">
        <span>Mai 2026</span>
        <span className="text-cyan-300">+3 demandes</span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[9px] text-[#9b8fb8]">
        {days.map((d) => (
          <span key={d}>{d}</span>
        ))}
        {Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "flex h-5 items-center justify-center rounded-md",
              i === 8 && "bg-violet-500/40 font-bold text-white ring-1 ring-violet-400/60",
              i === 11 && "bg-cyan-500/20 text-cyan-200",
              i !== 8 && i !== 11 && "text-white/40",
            )}
          >
            {i + 12}
          </span>
        ))}
      </div>
    </div>
  );
}

export function MiniClientList() {
  const rows = [
    { name: "Marie L.", tag: "À relancer", hot: true },
    { name: "Thomas B.", tag: "Fidèle", hot: false },
    { name: "Équipe Dupont", tag: "30 jours", hot: true },
  ];
  return (
    <div className="zg-mini-ui space-y-2 rounded-xl p-3">
      {rows.map((r) => (
        <div
          key={r.name}
          className="flex items-center justify-between rounded-lg border border-white/6 bg-white/[0.03] px-2.5 py-2"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/25 text-[10px] font-bold text-violet-200">
              {r.name[0]}
            </span>
            <span className="text-[11px] font-medium text-white">{r.name}</span>
          </div>
          <span
            className={cn(
              "text-[9px] font-semibold",
              r.hot ? "text-amber-300" : "text-[#9b8fb8]",
            )}
          >
            {r.tag}
          </span>
        </div>
      ))}
    </div>
  );
}

export function MiniCampaignEditor() {
  return (
    <div className="zg-mini-ui rounded-xl p-3">
      <div className="mb-2 flex items-center justify-between">
        <MiniChip active>IA</MiniChip>
        <span className="text-[9px] text-emerald-300">Prêt à envoyer</span>
      </div>
      <p className="text-[11px] leading-relaxed text-white/90">
        « Nouveau menu de saison — réservez votre table avant jeudi… »
      </p>
      <MiniProgress value={100} />
      <button
        type="button"
        className="mt-2 w-full rounded-lg bg-violet-600/80 py-1.5 text-[10px] font-semibold text-white"
      >
        Valider et envoyer
      </button>
    </div>
  );
}

export function MiniReviewTimeline() {
  const steps = ["Visite", "SMS", "Avis"];
  return (
    <div className="zg-mini-ui flex items-center gap-2 rounded-xl p-3">
      {steps.map((s, i) => (
        <div key={s} className="flex flex-1 flex-col items-center gap-1">
          <span
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold",
              i === 2
                ? "bg-emerald-500/25 text-emerald-300 ring-1 ring-emerald-400/40"
                : "bg-white/8 text-[#9b8fb8]",
            )}
          >
            {i + 1}
          </span>
          <span className="text-[9px] text-[#9b8fb8]">{s}</span>
        </div>
      ))}
    </div>
  );
}

export function MiniSuggestion() {
  return (
    <div className="zg-mini-ui rounded-xl border border-violet-400/25 bg-violet-500/10 p-3">
      <p className="text-[9px] font-semibold uppercase tracking-wider text-violet-300">
        Action recommandée
      </p>
      <p className="mt-1 text-[11px] font-medium text-white">
        Remplir jeudi soir — 22 clients ciblés
      </p>
      <MiniProgress value={85} />
    </div>
  );
}

export function MiniPagePreview() {
  return (
    <div className="zg-mini-ui overflow-hidden rounded-xl">
      <div className="h-14 bg-gradient-to-br from-violet-600/40 to-cyan-600/20" />
      <div className="space-y-2 p-3">
        <div className="h-2 w-3/4 rounded bg-white/15" />
        <div className="h-2 w-1/2 rounded bg-white/8" />
        <div className="mt-2 rounded-lg bg-violet-600/60 py-1.5 text-center text-[10px] font-semibold text-white">
          Réserver une table
        </div>
      </div>
    </div>
  );
}
