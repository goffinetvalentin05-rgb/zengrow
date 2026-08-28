import { ReactNode } from "react";
import { cn } from "@/src/lib/utils";

type DashboardContentProps = {
  children: ReactNode;
  className?: string;
  /**
   * Largeur max du contenu (hors sidebar).
   * - default: confort lecture / SaaS (recommandé)
   * - wide: pages pleine largeur (canvas)
   */
  width?: "default" | "wide";
};

export default function DashboardContent({ children, className, width = "default" }: DashboardContentProps) {
  return (
    <div
      className={cn(
        "w-full min-w-0",
        width === "wide" ? "max-w-[1280px]" : "max-w-[1120px]",
        "mx-auto space-y-6 md:space-y-8",
        className,
      )}
    >
      {children}
    </div>
  );
}

