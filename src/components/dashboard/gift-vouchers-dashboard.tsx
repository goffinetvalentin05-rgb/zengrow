"use client";

import { useCallback, useMemo, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import { cn } from "@/src/lib/utils";

export type GiftVoucherRow = {
  id: string;
  created_at: string;
  requester_first_name: string;
  requester_last_name: string;
  requester_email: string;
  requester_phone: string | null;
  amount_hint: string | null;
  beneficiary_name: string | null;
  occasion: string | null;
  message: string | null;
  status: "new" | "in_progress" | "sent" | "completed";
};

const STATUS_OPTIONS: { value: GiftVoucherRow["status"]; label: string }[] = [
  { value: "new", label: "Nouvelle demande" },
  { value: "in_progress", label: "En cours" },
  { value: "sent", label: "Bon envoyé" },
  { value: "completed", label: "Terminé" },
];

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("fr-CH", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function GiftVouchersDashboard({ initialRows }: { initialRows: GiftVoucherRow[] }) {
  const supabase = createClient();
  const [rows, setRows] = useState(initialRows);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...rows].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [rows],
  );

  const updateStatus = useCallback(
    async (id: string, status: GiftVoucherRow["status"]) => {
      setBusyId(id);
      setMessage(null);
      const { error } = await supabase.from("gift_voucher_requests").update({ status }).eq("id", id);
      setBusyId(null);
      if (error) {
        setMessage(error.message);
        return;
      }
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    },
    [supabase],
  );

  if (sorted.length === 0) {
    return (
      <div className="rounded-2xl border border-zg-border bg-zg-surface p-8 text-center text-sm text-zg-muted">
        Aucune demande de bon cadeau pour l’instant. Activez la section sur votre showroom pour en recevoir.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {message ? (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-950">
          {message}
        </p>
      ) : null}
      <div className="overflow-x-auto rounded-2xl border border-zg-border">
        <table className="min-w-full divide-y divide-zg-border text-left text-sm">
          <thead className="bg-zg-surface/80">
            <tr>
              <th className="px-4 py-3 font-semibold text-zg-fg">Date</th>
              <th className="px-4 py-3 font-semibold text-zg-fg">Demandeur</th>
              <th className="px-4 py-3 font-semibold text-zg-fg">Contact</th>
              <th className="px-4 py-3 font-semibold text-zg-fg">Montant</th>
              <th className="px-4 py-3 font-semibold text-zg-fg">Bénéficiaire</th>
              <th className="px-4 py-3 font-semibold text-zg-fg">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zg-border bg-zg-surface">
            {sorted.map((row) => (
              <tr key={row.id} className="align-top">
                <td className="whitespace-nowrap px-4 py-3 text-zg-muted">{formatDate(row.created_at)}</td>
                <td className="px-4 py-3">
                  <span className="font-medium text-zg-fg">
                    {row.requester_first_name} {row.requester_last_name}
                  </span>
                  {row.occasion ? (
                    <p className="mt-1 text-xs text-zg-muted">Occasion : {row.occasion}</p>
                  ) : null}
                  {row.message ? (
                    <p className="mt-2 max-w-xs text-xs leading-relaxed text-zg-muted">{row.message}</p>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <a href={`mailto:${row.requester_email}`} className="text-zg-accent hover:underline">
                    {row.requester_email}
                  </a>
                  {row.requester_phone ? (
                    <p className="mt-1 text-xs text-zg-muted">{row.requester_phone}</p>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-zg-fg">{row.amount_hint ?? "—"}</td>
                <td className="px-4 py-3">{row.beneficiary_name ?? "—"}</td>
                <td className="px-4 py-3">
                  <select
                    className={cn(
                      "max-w-[200px] rounded-lg border border-zg-border bg-zg-surface px-2 py-1.5 text-xs font-medium",
                      busyId === row.id && "opacity-60",
                    )}
                    value={row.status}
                    disabled={busyId === row.id}
                    onChange={(e) => updateStatus(row.id, e.target.value as GiftVoucherRow["status"])}
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
