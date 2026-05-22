import { CalendarPlus, MessageCircle, Star } from "lucide-react";
import {
  Container,
  GlassCard,
  IconBox,
  Section,
  SectionHeader,
} from "@/components/landing-page/ui";
import { ScrollReveal } from "@/components/landing-page/ScrollReveal";

const MOMENTS = [
  {
    step: "Avant la visite",
    title: "Réserver plus facilement",
    desc: "Aidez vos clients à réserver plus facilement grâce à une page claire et un système de réservation simple.",
    icon: CalendarPlus,
    accent: "from-violet-600/30",
  },
  {
    step: "Après la visite",
    title: "Avis Google automatisés",
    desc: "Automatisez les demandes d'avis Google et transformez vos clients satisfaits en preuve sociale.",
    icon: Star,
    accent: "from-fuchsia-600/25",
  },
  {
    step: "Entre deux visites",
    title: "Relances & campagnes IA",
    desc: "Utilisez l'IA pour relancer vos anciens clients, créer des campagnes et leur donner une bonne raison de revenir.",
    icon: MessageCircle,
    accent: "from-indigo-600/30",
  },
] as const;

export function ThreeMomentsSection() {
  return (
    <Section id="comment-ca-marche" className="relative">
      <Container>
        <ScrollReveal>
          <SectionHeader
            badge="Comment ça marche"
            title={
              <>
                ZenGrow agit sur les <span className="zg-lp-gradient">3 moments</span> qui comptent.
              </>
            }
          />
        </ScrollReveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3 md:gap-6">
          {MOMENTS.map((item, i) => (
            <ScrollReveal key={item.step} delay={i * 0.08}>
              <GlassCard strong className="flex h-full flex-col p-6 md:p-7">
                <div
                  className={`mb-5 h-1 w-12 rounded-full bg-gradient-to-r ${item.accent} to-transparent`}
                />
                <IconBox className="mb-5">
                  <item.icon className="size-5" />
                </IconBox>
                <p className="text-xs font-bold uppercase tracking-wider text-violet-400">{item.step}</p>
                <h3 className="zg-lp-display mt-2 text-lg font-bold text-[var(--zg-fg)]">{item.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--zg-muted)]">{item.desc}</p>
              </GlassCard>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
