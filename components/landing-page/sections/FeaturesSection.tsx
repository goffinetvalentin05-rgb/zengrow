import {
  Calendar,
  Globe,
  Mail,
  MessageSquare,
  Star,
  Users,
} from "lucide-react";
import { Container, Section, SectionHeader } from "@/components/landing-page/ui";
import { ScrollReveal } from "@/components/landing-page/ScrollReveal";

const MODULES = [
  { icon: Globe, label: "Page de réservation" },
  { icon: Calendar, label: "Réservations en ligne" },
  { icon: Users, label: "Base clients" },
  { icon: MessageSquare, label: "Relances IA" },
  { icon: Mail, label: "Campagnes marketing" },
  { icon: Star, label: "Avis Google" },
] as const;

export function FeaturesSection() {
  return (
    <Section id="fonctionnalites">
      <Container>
        <ScrollReveal>
          <SectionHeader
            title="Tout ce qu'il faut pour convertir et fidéliser."
            subtitle="ZenGrow centralise votre page, vos réservations, vos clients, vos campagnes et vos avis Google."
          />
        </ScrollReveal>

        {/* Bento asymétrique — pas de grille répétitive 3×2 */}
        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-12 lg:grid-rows-2 lg:gap-4">
          {MODULES.map((mod, i) => {
            const spans =
              i === 0
                ? "col-span-2 row-span-1 lg:col-span-5 lg:row-span-2"
                : i === 1
                  ? "col-span-1 lg:col-span-4"
                  : i === 2
                    ? "col-span-1 lg:col-span-3"
                    : i === 3
                      ? "col-span-2 lg:col-span-4"
                      : i === 4
                        ? "col-span-1 lg:col-span-4"
                        : "col-span-1 lg:col-span-4";

            return (
              <ScrollReveal
                key={mod.label}
                delay={i * 0.05}
                className={spans}
              >
                <div
                  className={`zg-lp-glass flex h-full flex-col justify-between p-4 sm:p-5 ${
                    i === 0 ? "min-h-[140px] sm:min-h-[180px]" : ""
                  }`}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(27,79,255,0.18)] text-[#3b7bff]">
                    <mod.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <p
                    className={`zg-lp-display mt-3 font-semibold text-[#EEF6FF] ${
                      i === 0 ? "text-lg sm:text-xl" : "text-sm"
                    }`}
                  >
                    {mod.label}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
