import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/landing-page/ui";

const LINKS = [
  { href: "#produit", label: "Produit" },
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#faq", label: "FAQ" },
  { href: "/login", label: "Connexion" },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-[rgba(27,79,255,0.15)] py-10">
      <Container className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4">
          <Image
            src="/logo-zengrow.png"
            alt="ZenGrow"
            width={120}
            height={36}
            className="h-8 w-auto opacity-90"
          />
          <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Pied de page">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-[#8BA3C7] transition hover:text-[#EEF6FF]"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="text-xs text-[#8BA3C7]/80">
          © {new Date().getFullYear()} ZenGrow. Tous droits réservés.
        </p>
      </Container>
    </footer>
  );
}
