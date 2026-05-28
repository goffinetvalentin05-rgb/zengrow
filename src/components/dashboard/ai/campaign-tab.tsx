"use client";

import { useState } from "react";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import Select from "@/src/components/ui/select";
import Textarea from "@/src/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import CopyTextButton from "@/src/components/dashboard/ai/copy-text-button";
import type { CampaignAIResult } from "@/src/lib/ai/types";
import type { useAIUsage } from "@/src/components/dashboard/ai/use-ai-usage";

const CHANNEL_OPTIONS = [
  { id: "email", label: "E-mail" },
  { id: "sms", label: "SMS" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "instagram", label: "Instagram" },
] as const;

type CampaignTabProps = {
  restaurantId: string;
  usage: ReturnType<typeof useAIUsage>["usage"];
  onUsageRefresh: () => void;
};

function ChannelBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="space-y-2 rounded-xl border border-zg-border bg-zg-surface-elevated p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-zg-fg">{title}</p>
        <CopyTextButton text={text} />
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-zg-text-secondary">{text}</p>
    </div>
  );
}

export default function CampaignTab({ restaurantId, usage, onUsageRefresh }: CampaignTabProps) {
  const [objective, setObjective] = useState("");
  const [offer, setOffer] = useState("");
  const [audience, setAudience] = useState("");
  const [channels, setChannels] = useState<string[]>(["email"]);
  const [tone, setTone] = useState("");
  const [language, setLanguage] = useState("fr");
  const [result, setResult] = useState<CampaignAIResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const atLimit = usage != null && usage.used >= usage.limit;

  function toggleChannel(id: string) {
    setChannels((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  async function generate() {
    if (!objective.trim()) {
      setError("Indiquez un objectif de campagne.");
      return;
    }
    if (channels.length === 0) {
      setError("Sélectionnez au moins un canal.");
      return;
    }
    if (atLimit) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/ai/campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objective,
          offer: offer || undefined,
          audience: audience || undefined,
          channels,
          tone: tone || undefined,
          language,
          restaurantId,
        }),
      });
      const data = (await res.json()) as CampaignAIResult & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Génération impossible.");
        return;
      }
      setResult(data);
      onUsageRefresh();
    } catch {
      setError("Génération impossible. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campagnes IA</CardTitle>
        <CardDescription>
          Générez des textes marketing adaptés à vos canaux de communication.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="dashboard-field-label">Objectif</label>
          <Textarea
            className="mt-2 min-h-20"
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="Ex. : Remplir le service du jeudi soir"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="dashboard-field-label">Offre (optionnel)</label>
            <Input className="mt-2" value={offer} onChange={(e) => setOffer(e.target.value)} />
          </div>
          <div>
            <label className="dashboard-field-label">Audience (optionnel)</label>
            <Input className="mt-2" value={audience} onChange={(e) => setAudience(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="dashboard-field-label">Canaux</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {CHANNEL_OPTIONS.map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => toggleChannel(ch.id)}
                className={
                  channels.includes(ch.id)
                    ? "rounded-lg bg-gradient-to-br from-[#7c5cff] to-[#6366f1] px-3 py-1.5 text-sm font-semibold text-white"
                    : "rounded-lg border border-zg-border px-3 py-1.5 text-sm font-medium text-zg-text-muted hover:bg-white/5"
                }
              >
                {ch.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="dashboard-field-label">Ton (optionnel)</label>
            <Input className="mt-2" value={tone} onChange={(e) => setTone(e.target.value)} placeholder="Chaleureux, premium…" />
          </div>
          <div>
            <label className="dashboard-field-label">Langue</label>
            <Select className="mt-2" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="fr">Français</option>
              <option value="de">Allemand</option>
              <option value="en">Anglais</option>
            </Select>
          </div>
        </div>

        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        <Button type="button" disabled={loading || atLimit} onClick={() => void generate()} className="min-h-11">
          {loading ? "Génération…" : "Générer la campagne"}
        </Button>

        {result ? (
          <div className="space-y-3">
            {result.emailSubject || result.emailBody ? (
              <ChannelBlock
                title="E-mail"
                text={[result.emailSubject, result.emailBody].filter(Boolean).join("\n\n")}
              />
            ) : null}
            {result.sms ? <ChannelBlock title="SMS" text={result.sms} /> : null}
            {result.whatsapp ? <ChannelBlock title="WhatsApp" text={result.whatsapp} /> : null}
            {result.instagramPost ? <ChannelBlock title="Instagram" text={result.instagramPost} /> : null}
            {result.cta ? <ChannelBlock title="Appel à l'action" text={result.cta} /> : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
