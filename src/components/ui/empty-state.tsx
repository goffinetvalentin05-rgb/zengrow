import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { cn } from "@/src/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
};

export default function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-10 text-center", className)}>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zg-surface-elevated ring-1 ring-zg-border transition-all duration-150">
        <Icon className="h-8 w-8 text-zg-text-muted" strokeWidth={1.5} aria-hidden />
      </div>
      <p className="mt-3 text-sm font-medium text-zg-text-secondary">{title}</p>
      <p className="mt-1 max-w-md text-xs leading-relaxed text-zg-text-muted">{description}</p>
      {action ? <div className="mt-5 flex w-full max-w-xs justify-center">{action}</div> : null}
    </div>
  );
}
