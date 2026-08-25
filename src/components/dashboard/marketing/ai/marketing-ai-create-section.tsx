"use client";

import { Sparkles } from "lucide-react";
import Button from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";

type MarketingAICreateSectionProps = {
  canUseAI: boolean;
  onOpen: () => void;
};

export default function MarketingAICreateSection({ canUseAI, onOpen }: MarketingAICreateSectionProps) {
  return (
    <Card className="border-zg-border/80 bg-gradient-to-br from-zg-surface to-zg-surface-elevated/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#a78bfa]" strokeWidth={2} />
          Créez une campagne avec l&apos;IA
        </CardTitle>
        <CardDescription>
          Décrivez votre offre, votre événement ou votre message. ZenGrow génère une campagne prête à
          envoyer à votre base clients.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {canUseAI ? (
          <Button type="button" className="min-h-11" onClick={onOpen}>
            Créer avec l&apos;IA
          </Button>
        ) : (
          <p className="text-sm text-zg-text-muted">
            La génération IA de campagnes est incluse dans le plan Pro (69 CHF/mois), avec les campagnes
            e-mail marketing.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
