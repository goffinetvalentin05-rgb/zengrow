"use client";

import type { LucideIcon } from "lucide-react";
import EmptyState from "@/src/components/ui/empty-state";
import { Card } from "@/src/components/ui/card";
import { cn } from "@/src/lib/utils";

type Props = {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
};

export function SharpzEmptyPanel({ title, description, icon, action, className }: Props) {
  return (
    <Card className={cn("flex min-h-[240px] items-center justify-center", className)}>
      <EmptyState title={title} description={description} icon={icon} action={action} />
    </Card>
  );
}
