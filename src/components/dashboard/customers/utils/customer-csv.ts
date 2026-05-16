import type { CustomerRecord } from "@/src/components/dashboard/customers/types";

function escapeCsvCell(value: string) {
  if (value.includes(";") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function downloadCustomersCsv(rows: CustomerRecord[]) {
  const header = ["Nom", "Email", "Téléphone", "Nombre de visites", "Dernière visite", "Couverts moyen"];
  const lines = rows.map((c) => {
    const last =
      c.lastVisitAt != null && c.lastVisitAt.length >= 10
        ? c.lastVisitAt.slice(0, 10)
        : (c.lastVisitAt ?? "");
    const avg = c.avgCovers != null ? String(c.avgCovers).replace(".", ",") : "";
    return [
      escapeCsvCell(c.name),
      escapeCsvCell(c.email ?? ""),
      escapeCsvCell(c.phone ?? ""),
      String(c.totalVisits),
      escapeCsvCell(last),
      escapeCsvCell(avg),
    ].join(";");
  });
  const csv = "\uFEFF" + [header.join(";"), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `clients-zengrow-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
