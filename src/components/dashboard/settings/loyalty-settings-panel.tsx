"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import Link from "next/link";
import Input from "@/src/components/ui/input";
import { SettingsAccordion } from "@/src/components/dashboard/settings/settings-accordion";
import LoyaltyRewardModal from "@/src/components/dashboard/loyalty/loyalty-reward-modal";
import Button from "@/src/components/ui/button";
import { centsToChf } from "@/src/lib/gift-vouchers/money";
import { formatPoints } from "@/src/lib/loyalty/points";
import type { LoyaltyProgramSettings, LoyaltyReward } from "@/src/lib/loyalty/types";

type LoyaltySettingsPanelProps = {
  onDirtyChange?: (dirty: boolean) => void;
};

export type LoyaltySettingsHandle = {
  isDirty: () => boolean;
  save: () => Promise<boolean>;
};

function snapshotOf(state: {
  spendAmountChf: string;
  pointsPerSpend: string;
  signupBonusPoints: string;
  pointsExpiration: string;
}) {
  return JSON.stringify(state);
}

const LoyaltySettingsPanel = forwardRef<LoyaltySettingsHandle, LoyaltySettingsPanelProps>(
  function LoyaltySettingsPanel({ onDirtyChange }, ref) {
    const [spendAmountChf, setSpendAmountChf] = useState("1");
    const [pointsPerSpend, setPointsPerSpend] = useState("1");
    const [signupBonusPoints, setSignupBonusPoints] = useState("50");
    const [pointsExpiration, setPointsExpiration] = useState("never");
    const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
    const [savedSnapshot, setSavedSnapshot] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [rewardModalOpen, setRewardModalOpen] = useState(false);

    const currentSnapshot = snapshotOf({ spendAmountChf, pointsPerSpend, signupBonusPoints, pointsExpiration });
    const dirty = Boolean(savedSnapshot) && currentSnapshot !== savedSnapshot;

    useEffect(() => {
      onDirtyChange?.(dirty);
    }, [dirty, onDirtyChange]);

    useEffect(() => {
      let cancelled = false;
      void (async () => {
        try {
          const [settingsRes, rewardsRes] = await Promise.all([fetch("/api/loyalty/settings"), fetch("/api/loyalty/rewards")]);
          const settingsPayload = (await settingsRes.json().catch(() => null)) as {
            settings?: LoyaltyProgramSettings;
            error?: string;
          } | null;
          const rewardsPayload = (await rewardsRes.json().catch(() => null)) as { rewards?: LoyaltyReward[] } | null;
          if (cancelled) return;
          if (!settingsRes.ok || !settingsPayload?.settings) {
            setError(settingsPayload?.error ?? "Impossible de charger les réglages fidélité.");
            return;
          }
          applySettings(settingsPayload.settings, true);
          setRewards(rewardsPayload?.rewards ?? []);
        } catch {
          if (!cancelled) setError("Impossible de charger les réglages fidélité.");
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, []);

    function applySettings(settings: LoyaltyProgramSettings, markSaved: boolean) {
      const next = {
        spendAmountChf: String(centsToChf(settings.spendAmountCents)),
        pointsPerSpend: String(settings.pointsPerSpend),
        signupBonusPoints: String(settings.signupBonusPoints),
        pointsExpiration: settings.pointsExpiration,
      };
      setSpendAmountChf(next.spendAmountChf);
      setPointsPerSpend(next.pointsPerSpend);
      setSignupBonusPoints(next.signupBonusPoints);
      setPointsExpiration(next.pointsExpiration);
      if (markSaved) setSavedSnapshot(snapshotOf(next));
    }

    useImperativeHandle(ref, () => ({
      isDirty: () => dirty,
      save: async () => {
        setSaving(true);
        setMessage(null);
        setError(null);
        try {
          const response = await fetch("/api/loyalty/settings", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              programType: "points",
              spendAmountChf: Number(spendAmountChf),
              pointsPerSpend: Number(pointsPerSpend),
              signupBonusPoints: Number(signupBonusPoints),
              pointsExpiration,
            }),
          });
          const payload = (await response.json().catch(() => null)) as {
            settings?: LoyaltyProgramSettings;
            error?: string;
          } | null;
          if (!response.ok || !payload?.settings) {
            setError(payload?.error ?? "Impossible d’enregistrer les réglages.");
            return false;
          }
          applySettings(payload.settings, true);
          setMessage("Réglages fidélité enregistrés.");
          return true;
        } catch {
          setError("Impossible d’enregistrer les réglages.");
          return false;
        } finally {
          setSaving(false);
        }
      },
    }));

    const sortedRewards = useMemo(
      () => [...rewards].sort((a, b) => a.pointsRequired - b.pointsRequired),
      [rewards],
    );

    if (loading) {
      return <p className="text-sm text-zg-text-muted">Chargement des réglages…</p>;
    }

    return (
      <div className="space-y-3">
        <SettingsAccordion title="Type de programme" defaultOpen>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-zg-accent bg-zg-accent/5 p-4">
              <p className="text-sm font-semibold text-zg-fg">Points</p>
              <p className="mt-1 text-xs text-zg-text-muted">Le client gagne des points à chaque achat. Système actuel.</p>
            </div>
            <div className="rounded-xl border border-zg-border bg-zg-surface-elevated/60 p-4 opacity-70">
              <p className="text-sm font-semibold text-zg-fg">Passages / tampons</p>
              <p className="mt-1 text-xs text-zg-text-muted">Prévu pour une prochaine version. Non disponible pour l’instant.</p>
            </div>
          </div>
        </SettingsAccordion>

        <SettingsAccordion title="Gain de points" defaultOpen>
          <p className="text-sm text-zg-text-muted">Pour chaque montant dépensé, le client gagne des points.</p>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <p className="pb-2.5 text-sm text-zg-fg">Pour chaque</p>
            <div className="w-24">
              <label className="dashboard-field-label" htmlFor="loyalty-spend">
                CHF
              </label>
              <Input
                id="loyalty-spend"
                inputMode="decimal"
                value={spendAmountChf}
                onChange={(event) => setSpendAmountChf(event.target.value)}
                className="mt-1.5"
              />
            </div>
            <p className="pb-2.5 text-sm text-zg-fg">CHF dépensé, le client gagne</p>
            <div className="w-24">
              <label className="dashboard-field-label" htmlFor="loyalty-points">
                Points
              </label>
              <Input
                id="loyalty-points"
                type="number"
                min={1}
                step={1}
                value={pointsPerSpend}
                onChange={(event) => setPointsPerSpend(event.target.value)}
                className="mt-1.5"
              />
            </div>
            <p className="pb-2.5 text-sm text-zg-fg">point{Number(pointsPerSpend) > 1 ? "s" : ""}</p>
          </div>
        </SettingsAccordion>

        <SettingsAccordion title="Bonus d’inscription" defaultOpen>
          <p className="text-sm text-zg-text-muted">Offert automatiquement à la création d’une carte. Mettez 0 pour désactiver.</p>
          <div className="mt-3 max-w-[10rem]">
            <label className="dashboard-field-label" htmlFor="loyalty-signup-bonus">
              Points
            </label>
            <Input
              id="loyalty-signup-bonus"
              type="number"
              min={0}
              step={1}
              value={signupBonusPoints}
              onChange={(event) => setSignupBonusPoints(event.target.value)}
              className="mt-1.5"
            />
          </div>
        </SettingsAccordion>

        <SettingsAccordion title="Récompenses" defaultOpen>
          {sortedRewards.length === 0 ? (
            <p className="text-sm text-zg-text-muted">Aucun palier pour l’instant.</p>
          ) : (
            <ul className="space-y-2">
              {sortedRewards.map((reward) => (
                <li key={reward.id} className="flex items-center justify-between gap-3 rounded-xl border border-zg-border px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zg-fg">{reward.title}</p>
                    <p className="text-xs text-zg-text-muted">{formatPoints(reward.pointsRequired)}</p>
                  </div>
                  <span className="text-xs text-zg-text-muted">{reward.active ? "Active" : "Inactive"}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 flex flex-wrap gap-3">
            <Button type="button" variant="secondary" size="sm" onClick={() => setRewardModalOpen(true)}>
              + Ajouter une récompense
            </Button>
            <Link href="/dashboard/loyalty?tab=rewards" className="text-sm font-medium text-zg-accent hover:underline">
              Gérer dans Fidélité →
            </Link>
          </div>
        </SettingsAccordion>

        <SettingsAccordion title="Expiration des points">
          <p className="text-sm text-zg-text-muted">
            Réglage enregistré pour plus tard. L’expiration automatique n’est pas encore appliquée aux soldes.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {[
              { id: "never", label: "Jamais" },
              { id: "months_6", label: "6 mois" },
              { id: "months_12", label: "12 mois" },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setPointsExpiration(option.id)}
                className={
                  pointsExpiration === option.id
                    ? "rounded-xl border border-zg-accent bg-zg-accent/10 px-3 py-2.5 text-sm font-semibold text-zg-fg"
                    : "rounded-xl border border-zg-border px-3 py-2.5 text-sm font-medium text-zg-text-muted hover:border-zg-border-hover"
                }
              >
                {option.label}
              </button>
            ))}
          </div>
        </SettingsAccordion>

        {error ? <p className="text-sm font-medium text-zg-danger">{error}</p> : null}
        {message && !error ? <p className="text-sm text-zg-text-muted">{message}</p> : null}
        {saving ? <p className="sr-only">Enregistrement en cours</p> : null}

        <LoyaltyRewardModal
          open={rewardModalOpen}
          onClose={() => setRewardModalOpen(false)}
          onSaved={(reward) => setRewards((current) => [...current.filter((item) => item.id !== reward.id), reward])}
        />
      </div>
    );
  },
);

export default LoyaltySettingsPanel;
