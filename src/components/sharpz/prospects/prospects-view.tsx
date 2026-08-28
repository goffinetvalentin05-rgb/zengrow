"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import PageHeader from "@/src/components/dashboard/page-header";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import { Card } from "@/src/components/ui/card";
import Badge from "@/src/components/ui/badge";
import Select from "@/src/components/ui/select";
import { SharpzEmptyPanel } from "@/src/components/sharpz/empty-panel";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";
import type { Prospect, ProspectStatus } from "@/src/lib/sharpz/types";

const STATUSES: ProspectStatus[] = [
  "new",
  "to_contact",
  "contacted",
  "replied",
  "qualified",
  "customer",
  "refused",
];

type Props = {
  prospects: Prospect[];
};

export function ProspectsView({ prospects }: Props) {
  const { t } = useDashboardI18n();
  const router = useRouter();
  const showToast = useDashboardToast();
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function updateStatus(id: string, status: string) {
    setPendingId(id);
    const response = await fetch(`/api/sharpz/prospects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setPendingId(null);
    if (!response.ok) {
      showToast({ message: t.common.error });
      return;
    }
    router.refresh();
  }

  return (
    <DashboardContent>
      <PageHeader title={t.prospectsPage.title} subtitle={t.prospectsPage.subtitle} />
      {prospects.length ? (
        <div className="grid gap-4">
          {prospects.map((item) => (
            <Card key={item.id} className="space-y-3 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-zg-fg">{item.company}</h3>
                  {item.url ? <p className="mt-1 text-sm text-zg-text-muted">{item.url}</p> : null}
                </div>
                <Select
                  value={item.status}
                  disabled={pendingId === item.id}
                  onChange={(event) => updateStatus(item.id, event.target.value)}
                  className="max-w-[180px]"
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {t.prospectStatuses[status]}
                    </option>
                  ))}
                </Select>
              </div>
              {item.fitScore != null ? <Badge tone="accent">{t.prospectsPage.fitScore} {item.fitScore}/100</Badge> : null}
              {item.whyFit ? (
                <p className="text-sm leading-relaxed text-zg-text-secondary">{item.whyFit}</p>
              ) : null}
              {item.contact ? (
                <p className="text-sm text-zg-text-muted">
                  {t.prospectsPage.contact}: {item.contact}
                </p>
              ) : null}
              {item.notes ? (
                <p className="text-sm text-zg-text-muted">
                  {t.prospectsPage.notes}: {item.notes}
                </p>
              ) : null}
            </Card>
          ))}
        </div>
      ) : (
        <SharpzEmptyPanel title={t.empty.noProspectsTitle} description={t.empty.noProspectsDescription} icon={Users} />
      )}
    </DashboardContent>
  );
}
