import type { CampaignRecord, CampaignRecipientDetail } from "@/src/components/dashboard/marketing/types";

function recipientStatusLabel(recipient: CampaignRecipientDetail): string {
  if (recipient.openedAt) return "Ouvert";
  return "Non ouvert";
}

export function downloadCampaignRecipientsCsv(
  campaign: CampaignRecord,
  recipients: readonly CampaignRecipientDetail[],
): void {
  const header = ["email", "statut", "envoye_le", "ouvert_le"];
  const rows = recipients.map((recipient) => [
    recipient.email,
    recipientStatusLabel(recipient),
    recipient.sentAt,
    recipient.openedAt ?? "",
  ]);

  const csv = [header, ...rows]
    .map((cols) =>
      cols
        .map((value) => {
          const cell = String(value ?? "");
          if (/[",\n\r]/.test(cell)) {
            return `"${cell.replaceAll('"', '""')}"`;
          }
          return cell;
        })
        .join(","),
    )
    .join("\n");

  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `campagne-${campaign.name.replace(/[^\w\-]+/g, "-").slice(0, 48) || "export"}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
