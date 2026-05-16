"use client";

import type { ReservationRow } from "@/src/components/dashboard/reservations/types";
import { cn } from "@/src/lib/utils";
import {
  AlertTriangle,
  Check,
  LogIn,
  MessageSquare,
  Pencil,
  Phone,
  X,
} from "lucide-react";

export type ReservationQuickActionHandlers = {
  onConfirm: () => void;
  onCancel: () => void;
  onNoShow: () => void;
  onArrived: () => void;
  onCall: () => void;
  onMessage: () => void;
  onEdit: () => void;
};

type ReservationQuickActionsProps = {
  reservation: ReservationRow;
  handlers: ReservationQuickActionHandlers;
  disabled?: boolean;
  className?: string;
};

type ActionDef = {
  key: string;
  label: string;
  icon: typeof Check;
  onClick: () => void;
  tone?: "default" | "success" | "danger" | "warning";
  visible: boolean;
};

function actionButtonClass(tone: ActionDef["tone"]) {
  return cn(
    "rounded-lg p-2 transition-colors",
    tone === "success" && "text-zg-success hover:bg-zg-success-soft-bg",
    tone === "danger" && "text-zg-danger hover:bg-zg-danger-soft-bg",
    tone === "warning" && "text-zg-warning hover:bg-zg-warning-soft-bg",
    (!tone || tone === "default") && "text-zg-muted hover:bg-zg-card-hover hover:text-zg-fg",
  );
}

export default function ReservationQuickActions({
  reservation,
  handlers,
  disabled = false,
  className,
}: ReservationQuickActionsProps) {
  const hasPhone = Boolean(reservation.guest_phone?.trim());
  const hasEmail = Boolean(reservation.guest_email?.trim());

  const actions: ActionDef[] = [
    {
      key: "confirm",
      label: "Confirmer",
      icon: Check,
      onClick: handlers.onConfirm,
      tone: "success",
      visible: reservation.status === "pending",
    },
    {
      key: "cancel",
      label: "Annuler",
      icon: X,
      onClick: handlers.onCancel,
      tone: "danger",
      visible: reservation.status !== "cancelled" && reservation.status !== "completed",
    },
    {
      key: "noshow",
      label: "Marquer absent",
      icon: AlertTriangle,
      onClick: handlers.onNoShow,
      tone: "warning",
      visible: reservation.status === "confirmed" || reservation.status === "pending",
    },
    {
      key: "arrived",
      label: "Marquer arrivée",
      icon: LogIn,
      onClick: handlers.onArrived,
      tone: "success",
      visible: reservation.status === "confirmed" || reservation.status === "pending",
    },
    {
      key: "call",
      label: hasPhone ? "Appeler" : "Pas de téléphone",
      icon: Phone,
      onClick: handlers.onCall,
      visible: true,
    },
    {
      key: "message",
      label: hasEmail ? "Envoyer un message" : "Pas d'email",
      icon: MessageSquare,
      onClick: handlers.onMessage,
      visible: true,
    },
    {
      key: "edit",
      label: "Voir le détail",
      icon: Pencil,
      onClick: handlers.onEdit,
      visible: true,
    },
  ];

  const visibleActions = actions.filter((a) => a.visible);

  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-0.5 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100",
        className,
      )}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {visibleActions.map(({ key, label, icon: Icon, onClick, tone }) => (
        <button
          key={key}
          type="button"
          title={label}
          aria-label={label}
          disabled={disabled || (key === "call" && !hasPhone) || (key === "message" && !hasEmail)}
          onClick={onClick}
          className={cn(
            actionButtonClass(tone),
            ((key === "call" && !hasPhone) || (key === "message" && !hasEmail)) &&
              "cursor-not-allowed opacity-40",
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
        </button>
      ))}
    </div>
  );
}
