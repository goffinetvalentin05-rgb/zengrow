"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { isFollowUpOverdue, isFollowUpToday, isPipelineStatus } from "@/src/lib/sharpz/prospects-pipeline";
import type { Prospect, ProspectStatus } from "@/src/lib/sharpz/types";
import { cn } from "@/src/lib/utils";

type Props = {
  prospects: Prospect[];
  statusLabels: Record<ProspectStatus, string>;
  dateLocale: string;
  copy: {
    listName: string;
    listCompany: string;
    listContact: string;
    listStatus: string;
    listFollowUp: string;
    listFit: string;
    overdue: string;
    dueToday: string;
  };
  onSelect: (prospect: Prospect) => void;
};

export function ProspectsList({ prospects, statusLabels, dateLocale, copy, onSelect }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>{copy.listName}</TableHead>
          <TableHead>{copy.listCompany}</TableHead>
          <TableHead>{copy.listContact}</TableHead>
          <TableHead>{copy.listStatus}</TableHead>
          <TableHead>{copy.listFollowUp}</TableHead>
          <TableHead>{copy.listFit}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {prospects.map((item) => {
          const status = isPipelineStatus(item.status) ? item.status : "to_contact";
          const due = isFollowUpToday(item.nextFollowUpAt);
          const overdue = isFollowUpOverdue(item.nextFollowUpAt);
          return (
            <TableRow
              key={item.id}
              className="cursor-pointer"
              onClick={() => onSelect(item)}
            >
              <TableCell className="font-medium">{item.name?.trim() || item.company}</TableCell>
              <TableCell className="text-zg-text-secondary">{item.company || "—"}</TableCell>
              <TableCell className="text-zg-text-secondary">{item.contact || item.email || "—"}</TableCell>
              <TableCell className="text-zg-text-secondary">{statusLabels[status]}</TableCell>
              <TableCell>
                {item.nextFollowUpAt ? (
                  <span className={cn(overdue && "text-zg-warning", due && !overdue && "text-zg-fg")}>
                    {overdue
                      ? copy.overdue
                      : due
                        ? copy.dueToday
                        : new Date(item.nextFollowUpAt).toLocaleDateString(dateLocale)}
                  </span>
                ) : (
                  <span className="text-zg-muted">—</span>
                )}
              </TableCell>
              <TableCell className="tabular-nums text-zg-text-secondary">
                {item.fitScore != null ? item.fitScore : "—"}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
