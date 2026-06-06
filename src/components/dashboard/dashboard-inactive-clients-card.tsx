import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonClassName } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

export type InactiveClientPreview = {
  id: string;
  displayName: string;
  daysSinceVisit: number;
};

type DashboardInactiveClientsCardProps = {
  clients: InactiveClientPreview[];
  className?: string;
};

export default function DashboardInactiveClientsCard({
  clients,
  className,
}: DashboardInactiveClientsCardProps) {
  return (
    <div
      className={cn(
        "relative isolate flex h-full min-h-[240px] min-w-0 flex-col overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-[#7c5cff] via-[#6366f1] to-[#4f46e5] p-6 text-white shadow-[0_0_60px_-12px_rgba(124,92,255,0.55)] transition-all duration-200 ease-out",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border border-white/10 opacity-40"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full border border-white/10 opacity-25"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_55%)]"
        aria-hidden
      />

      <p className="relative font-landing-serif text-xl italic leading-none text-white/95">ZenGrow</p>
      <p className="relative mt-auto text-sm font-medium text-white/85">Clients à récupérer</p>

      {clients.length > 0 ? (
        <ul className="relative mt-4 space-y-2.5">
          {clients.map((client) => (
            <li key={client.id} className="text-sm text-white/90">
              <span className="font-medium text-white">{client.displayName}</span>
              <span className="text-white/75">
                {" "}
                — dernière visite il y a {client.daysSinceVisit} jour
                {client.daysSinceVisit > 1 ? "s" : ""}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="relative mt-4 text-sm text-white/75">
          Aucun client inactif détecté pour le moment. Continuez à enrichir votre base clients.
        </p>
      )}

      <Link
        href="/dashboard/marketing"
        className={buttonClassName({
          variant: "secondary",
          size: "sm",
          className:
            "relative mt-6 w-full border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white sm:w-auto",
        })}
      >
        Préparer les relances
        <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
      </Link>
    </div>
  );
}
