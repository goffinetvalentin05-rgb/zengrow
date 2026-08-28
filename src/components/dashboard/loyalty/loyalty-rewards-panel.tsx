"use client";

import { useState } from "react";
import { Gift, Plus } from "lucide-react";
import LoyaltyRewardModal from "@/src/components/dashboard/loyalty/loyalty-reward-modal";
import Badge from "@/src/components/ui/badge";
import Button from "@/src/components/ui/button";
import { formatPoints } from "@/src/lib/loyalty/points";
import type { LoyaltyReward } from "@/src/lib/loyalty/types";

type LoyaltyRewardsPanelProps = {
  rewards: LoyaltyReward[];
  onChange: (rewards: LoyaltyReward[]) => void;
};

export default function LoyaltyRewardsPanel({ rewards, onChange }: LoyaltyRewardsPanelProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<LoyaltyReward | null>(null);

  const sorted = [...rewards].sort((a, b) => a.pointsRequired - b.pointsRequired);

  function handleSaved(reward: LoyaltyReward) {
    const exists = rewards.some((item) => item.id === reward.id);
    onChange(exists ? rewards.map((item) => (item.id === reward.id ? reward : item)) : [...rewards, reward]);
  }

  async function toggleActive(reward: LoyaltyReward) {
    const response = await fetch(`/api/loyalty/rewards/${reward.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !reward.active }),
    });
    const payload = (await response.json().catch(() => null)) as { reward?: LoyaltyReward } | null;
    if (response.ok && payload?.reward) {
      onChange(rewards.map((item) => (item.id === payload.reward!.id ? payload.reward! : item)));
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-zg-fg">Paliers de récompenses</h2>
          <p className="mt-0.5 text-sm text-zg-text-muted">
            Ils s’affichent automatiquement dès que le client atteint le nombre de points.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Ajouter une récompense
        </Button>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-zg-border bg-zg-surface px-6 py-12 text-center">
          <Gift className="mx-auto h-8 w-8 text-zg-accent" strokeWidth={1.75} aria-hidden />
          <p className="mt-3 text-base font-semibold text-zg-fg">Aucune récompense pour l’instant</p>
          <p className="mt-1 text-sm text-zg-text-muted">Ajoutez un premier palier, par exemple 500 points → 5 CHF offerts.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((reward) => (
            <article
              key={reward.id}
              className="flex flex-col rounded-2xl border border-zg-border bg-zg-surface p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-zg-fg">{reward.title}</h3>
                <Badge tone={reward.active ? "success" : "neutral"}>{reward.active ? "Active" : "Inactive"}</Badge>
              </div>
              <p className="mt-2 text-sm font-medium tabular-nums text-zg-accent">{formatPoints(reward.pointsRequired)}</p>
              {reward.description ? (
                <p className="mt-2 text-sm leading-relaxed text-zg-text-muted">{reward.description}</p>
              ) : null}
              <div className="mt-auto flex gap-2 pt-5">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setEditing(reward);
                    setModalOpen(true);
                  }}
                >
                  Modifier
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => void toggleActive(reward)}>
                  {reward.active ? "Désactiver" : "Activer"}
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <LoyaltyRewardModal
        open={modalOpen}
        reward={editing}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
      />
    </section>
  );
}
