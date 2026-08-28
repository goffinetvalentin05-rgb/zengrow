"use client";

import { useState } from "react";
import Button from "@/src/components/ui/button";
import Textarea from "@/src/components/ui/textarea";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";

type Props = {
  snippet: string;
  hasData: boolean;
  lastEventAt: string | null;
};

export function AnalyticsSnippetPanel({ snippet, hasData, lastEventAt }: Props) {
  const { t } = useDashboardI18n();
  const [copied, setCopied] = useState(false);

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
      <h3 className="text-base font-semibold text-zg-fg">{t.settingsPage.analyticsInstall}</h3>
      <p className="mt-2 text-sm text-zg-text-secondary">{t.settingsPage.analyticsInstallDescription}</p>
      <Textarea readOnly className="mt-4 min-h-20 font-mono text-xs" value={snippet} />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => {
            void navigator.clipboard.writeText(snippet);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
          }}
        >
          {copied ? t.analyticsPage.snippetCopied : t.analyticsPage.copySnippet}
        </Button>
        <span className="text-xs text-zg-muted">
          {hasData
            ? `${t.analyticsPage.trafficConnected}${lastEventAt ? ` — ${new Date(lastEventAt).toLocaleString()}` : ""}`
            : t.analyticsPage.trafficWaiting}
        </span>
      </div>
    </div>
  );
}
