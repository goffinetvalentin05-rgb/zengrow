"use client";

import Link from "next/link";
import { ReactNode, useLayoutEffect } from "react";
import { CheckCircle2, Copy } from "lucide-react";
import { cn } from "@/src/lib/utils";
import ActionMenu, { ActionMenuItem } from "@/src/components/dashboard/ui/action-menu";
import Button, { buttonClassName } from "@/src/components/ui/button";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";
import { useSetDashboardTitle } from "@/src/components/dashboard/dashboard-title-context";

type HeaderAction =
  | { kind: "link"; href: string; label: string; icon?: ReactNode }
  | { kind: "external"; href: string; label: string; icon?: ReactNode }
  | { kind: "copy"; value: string; label: string; icon?: ReactNode }
  | { kind: "button"; onClick: () => void; label: string; icon?: ReactNode; disabled?: boolean };

type PageHeaderProps = {
  kicker?: string;
  title: string;
  subtitle?: string;
  className?: string;
  /** Action principale (droite). */
  primaryAction?: HeaderAction;
  /** 0-2 actions secondaires (droite). */
  secondaryActions?: HeaderAction[];
  /** Actions supplémentaires dans un menu (droite). */
  menuItems?: ActionMenuItem[];
  /** Contenu optionnel sous le header (ex: bar de filtres). */
  children?: ReactNode;
};

function HeaderActionButton({ action, variant }: { action: HeaderAction; variant: "primary" | "secondary" | "ghost" }) {
  const showToast = useDashboardToast();

  if (action.kind === "link") {
    return (
      <Link href={action.href} className={buttonClassName({ variant, size: "sm" })}>
        {action.icon}
        {action.label}
      </Link>
    );
  }

  if (action.kind === "external") {
    return (
      <a href={action.href} target="_blank" rel="noreferrer" className={buttonClassName({ variant, size: "sm" })}>
        {action.icon}
        {action.label}
      </a>
    );
  }

  if (action.kind === "button") {
    return (
      <Button type="button" variant={variant} size="sm" onClick={action.onClick} disabled={action.disabled}>
        {action.icon}
        {action.label}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant={variant}
      size="sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(action.value);
          showToast({ message: "Lien copié dans le presse-papiers.", icon: CheckCircle2 });
        } catch {
          showToast({ message: "Impossible de copier le lien.", icon: Copy });
        }
      }}
    >
      {action.icon}
      {action.label}
    </Button>
  );
}

export default function PageHeader({
  kicker,
  title,
  subtitle,
  className,
  primaryAction,
  secondaryActions = [],
  menuItems,
  children,
}: PageHeaderProps) {
  const setDashboardTitle = useSetDashboardTitle();

  useLayoutEffect(() => {
    if (!setDashboardTitle) return;
    setDashboardTitle({ title, subtitle });
    return () => {
      setDashboardTitle(null);
    };
  }, [title, subtitle, setDashboardTitle]);

  return (
    <section className={cn("space-y-4 md:space-y-5", className)}>
      <header className="dashboard-page-header flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-6">
        <div className="min-w-0">
          {kicker ? <p className="dashboard-section-kicker">{kicker}</p> : null}
          <h1 className={cn("dashboard-page-title", kicker ? "mt-2" : "", "truncate")}>{title}</h1>
          {subtitle ? <p className="dashboard-section-subtitle mt-2 max-w-2xl">{subtitle}</p> : null}
        </div>
        {(primaryAction || secondaryActions.length > 0 || (menuItems && menuItems.length > 0)) ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2 md:justify-end md:pt-1">
            {secondaryActions.slice(0, 2).map((action) => (
              <HeaderActionButton key={action.label} action={action} variant="secondary" />
            ))}
            {menuItems && menuItems.length > 0 ? <ActionMenu items={menuItems} /> : null}
            {primaryAction ? <HeaderActionButton action={primaryAction} variant="primary" /> : null}
          </div>
        ) : null}
      </header>
      {children ? <div>{children}</div> : null}
    </section>
  );
}

