import Link from "next/link";
import { Container } from "@/components/landing-v2/ui";

const product = [
  { href: "#hero", label: "Produit" },
  { href: "#features", label: "Fonctionnalités" },
  { href: "#pricing", label: "Tarifs" },
  { href: "#faq", label: "FAQ" },
  { href: "mailto:contact@zengrow.ch", label: "Contact" },
] as const;

const legal = [
  { href: "#", label: "CGU" },
  { href: "#", label: "Politique de confidentialité" },
] as const;

export function LandingFooter() {
  return (
    <footer className="border-t border-[rgba(59,158,255,0.12)] py-12">
      <Container>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-[#8BA3C7]" aria-label="Pied de page">
          {product.map((l) => (
            <Link key={l.label} href={l.href} className="hover:text-[#EEF6FF]">
              {l.label}
            </Link>
          ))}
          <Link href="/login" className="hover:text-[#EEF6FF]">
            Connexion
          </Link>
        </nav>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-[rgba(255,255,255,0.06)] pt-8 text-xs text-[#8BA3C7] sm:flex-row">
          <p>© 2026 ZenGrow. Tous droits réservés.</p>
          <div className="flex gap-6">
            {legal.map((l) => (
              <Link key={l.label} href={l.href} className="hover:text-[#EEF6FF]">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
