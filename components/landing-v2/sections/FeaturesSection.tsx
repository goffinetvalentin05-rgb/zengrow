import {
  Calendar,
  Globe,
  Megaphone,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { Container, Section, SectionHeader } from "@/components/landing-v2/ui";

const features = [
  { label: "Page de réservation", icon: Globe, large: true },
  { label: "Réservations en ligne", icon: Calendar },
  { label: "Base clients", icon: Users },
  { label: "Relances IA", icon: Sparkles, highlight: true },
  { label: "Campagnes marketing", icon: Megaphone },
  { label: "Avis Google", icon: Star },
] as const;

export function FeaturesSection() {
  const lead = features[0];
  const LeadIcon = lead.icon;
  const side = features.slice(1, 3);
  const bottom = features.slice(3);

  return (
    <Section id="features">
      <Container>
        <SectionHeader
          title="Tout ce qu'il faut pour convertir et fidéliser."
          subtitle="ZenGrow centralise votre page, vos réservations, vos clients, vos campagnes et vos avis Google."
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-12">
          <article className="zg-card zg-card--glow p-6 sm:p-8 lg:col-span-7 lg:row-span-2">
            <LeadIcon className="size-6 text-[#5EB3FF]" strokeWidth={1.5} aria-hidden />
            <h3 className="mt-4 font-[family-name:var(--font-instrument-serif)] text-2xl text-[#EEF6FF]">
              {lead.label}
            </h3>
            <div className="mx-auto mt-8 max-w-[200px] rounded-2xl border border-[rgba(59,158,255,0.25)] bg-[rgba(0,0,0,0.3)] p-3 lg:mx-0">
              <div className="h-14 rounded-lg bg-gradient-to-br from-[rgba(43,140,255,0.4)] to-transparent" />
              <div className="mt-2 rounded-md bg-[#2B8CFF] py-2 text-center text-[10px] font-semibold text-white">
                Réserver
              </div>
            </div>
          </article>

          <div className="flex flex-col gap-5 lg:col-span-5">
            {side.map((f) => (
              <article key={f.label} className="zg-card p-5">
                <f.icon className="size-5 text-[#5EB3FF]" strokeWidth={1.5} aria-hidden />
                <h3 className="mt-3 text-base font-semibold text-[#EEF6FF]">{f.label}</h3>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          {bottom.map((f) => (
            <article
              key={f.label}
              className={`zg-card p-5 ${"highlight" in f && f.highlight ? "zg-card--glow" : ""}`}
            >
              <f.icon className="size-5 text-[#5EB3FF]" strokeWidth={1.5} aria-hidden />
              <h3 className="mt-3 text-sm font-semibold text-[#EEF6FF]">{f.label}</h3>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
