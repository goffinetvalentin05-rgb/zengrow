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
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zg-accent-soft-bg transition-all duration-200 ease-out">
        <Icon className="h-10 w-10 text-zg-accent" strokeWidth={1.5} aria-hidden />
      </div>
      <p className="mt-4 text-base font-medium text-zg-fg">{title}</p>
      <p className="mt-1 max-w-md text-sm leading-relaxed text-zg-text-muted">{description}</p>
      {action ? <div className="mt-4 flex w-full max-w-xs justify-center">{action}</div> : null}
    </div>
  );
}
