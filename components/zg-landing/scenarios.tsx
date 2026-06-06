import { X } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { MiniChip } from "./visuals";

/** Client inactif : satisfait mais ne revient plus */
export function ScenarioClientLost() {
  return (
    <div className="zg-mini-ui space-y-2 rounded-xl p-3">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">
          T
        </span>
        <div>
          <p className="text-[11px] font-semibold text-white">Thomas B.</p>
          <p className="text-[9px] text-[#9b8fb8]">Dernière visite · 45 j</p>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 rounded-lg border border-red-400/30 bg-red-500/10 py-2">
        <X className="h-3.5 w-3.5 text-red-300" />
        <span className="text-[10px] font-semibold text-red-200">Ne revient plus</span>
      </div>
    </div>
  );
}

/** Client venu une fois, pas de relance */
export function ScenarioClientNoFollowup() {
  return (
    <div className="zg-mini-ui rounded-xl p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">
            M
          </span>
          <div>
            <p className="text-[11px] font-semibold text-white">Marie D.</p>
            <p className="text-[9px] text-[#9b8fb8]">Dernière visite · 32 j</p>
          </div>
        </div>
        <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[9px] font-semibold text-amber-200">
          Aucune relance
        </span>
      </div>
      <div className="mt-3 h-8 rounded-md border border-dashed border-white/15 bg-white/[0.02]" />
    </div>
  );
}

/** Visite confirmée, avis non demandé */
export function ScenarioReviewMissed() {
  return (
    <div className="zg-mini-ui space-y-2 rounded-xl p-3">
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-emerald-300">Visite confirmée</span>
        <span className="text-[#9b8fb8]">Hier 20h</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 rounded-lg bg-white/5 py-2 text-center text-[9px] text-white/60">
          Avis Google
        </div>
        <span className="text-[9px] text-red-300/90">Non envoyé</span>
      </div>
    </div>
  );
}

/** Hero — carte réservations */
export function HeroCardReservations() {
  return (
    <div className="zg-mini-ui w-full rounded-xl p-3">
      <p className="text-[10px] text-[#9b8fb8]">Cette semaine</p>
      <p className="text-lg font-bold text-white">12 réservations</p>
      <div className="mt-2 flex h-8 items-end gap-0.5">
        {[4, 6, 5, 8, 7, 10, 9].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-gradient-to-t from-violet-600/50 to-cyan-400/70"
            style={{ height: `${h * 10}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function HeroCardCampaign() {
  return (
    <div className="zg-mini-ui w-full rounded-xl p-3">
      <MiniChip active>IA</MiniChip>
      <p className="mt-2 text-[11px] font-semibold text-white">Campagne prête</p>
      <p className="text-[9px] text-emerald-300">À envoyer</p>
    </div>
  );
}

export function HeroCardRelances() {
  return (
    <div className="zg-mini-ui w-full rounded-xl p-3">
      <p className="text-[10px] text-[#9b8fb8]">À relancer</p>
      <p className="text-lg font-bold text-amber-200">8 clients</p>
      <div className="mt-2 space-y-1">
        {["Marie", "Thomas"].map((n) => (
          <div key={n} className="h-1.5 rounded-full bg-white/10">
            <div className="h-full w-2/3 rounded-full bg-violet-500/50" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function HeroCardAvis() {
  return (
    <div className="zg-mini-ui w-full rounded-xl p-3">
      <p className="text-[10px] text-[#9b8fb8]">Avis Google</p>
      <p className="text-lg font-bold text-white">5 programmés</p>
      <div className="mt-2 flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full bg-emerald-400/60"
          />
        ))}
      </div>
    </div>
  );
}

export function HeroCardTuesday() {
  return (
    <div className="zg-mini-ui w-full rounded-xl border border-violet-400/25 bg-violet-500/10 p-3">
      <p className="text-[10px] text-violet-300">Suggestion</p>
      <p className="text-[11px] font-semibold text-white">Mardi soir à remplir</p>
    </div>
  );
}

/** Workflow step mini */
export function WorkflowStepUI({
  label,
  detail,
  variant = "default",
}: {
  label: string;
  detail: string;
  variant?: "default" | "ai" | "success";
}) {
  return (
    <div
      className={cn(
        "zg-mini-ui rounded-xl p-3 text-center",
        variant === "ai" && "border border-violet-400/30 bg-violet-500/10",
        variant === "success" && "border border-emerald-400/25 bg-emerald-500/8",
      )}
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-violet-300">
        {label}
      </p>
      <p className="mt-1 text-xs font-medium text-white">{detail}</p>
    </div>
  );
}

/** IA — relance prête */
export function AICampaignReadyCard() {
  return (
    <div className="zg-mini-ui mt-4 rounded-xl border border-emerald-400/25 bg-emerald-500/8 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
        Relance prête
      </p>
      <ul className="mt-2 space-y-1 text-xs text-white/90">
        <li>8 clients inactifs détectés</li>
        <li>Envoi proposé : jeudi 18h</li>
      </ul>
    </div>
  );
}
