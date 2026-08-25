import Image from "next/image";
import Link from "next/link";
import { Container } from "../ui";

const PRODUCT_LINKS = [
  { href: "#workflow", label: "Fonctionnalités" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#faq", label: "FAQ" },
] as const;

const RESOURCE_LINKS = [
  { href: "#", label: "Blog" },
  { href: "#workflow", label: "Démo" },
  { href: "mailto:contact@zengrow.ch", label: "Contact" },
] as const;

const LEGAL_LINKS = [
  { href: "/conditions", label: "Conditions d'utilisation" },
  { href: "/confidentialite", label: "Confidentialité" },
  { href: "/mentions-legales", label: "Mentions légales" },
] as const;

export function Footer() {
  return (
    <footer className="zg-footer-v4 zg-footer-v4--light relative z-[1]">
      <Container className="pb-0">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex shrink-0" aria-label="ZenGrow — accueil">
              <Image
                src="/zengrow-logo.png"
                alt="ZenGrow"
                width={1584}
                height={396}
                className="h-9 w-auto sm:h-10"
              />
            </Link>
            <p className="zg-footer-v4__tagline">
              Votre travail est terminé. Le nôtre commence.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5 lg:col-start-6">
            <div>
              <p className="zg-footer-v4__heading">Produit</p>
              <ul className="mt-4 space-y-2.5">
                {PRODUCT_LINKS.map((link) => (
                  <li key={link.href}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="zg-footer-v4__heading">Ressources</p>
              <ul className="mt-4 space-y-2.5">
                {RESOURCE_LINKS.map((link) => (
                  <li key={link.label}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <p className="zg-footer-v4__heading">Légal</p>
              <ul className="mt-4 space-y-2.5">
                {LEGAL_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-3">
            <p className="zg-footer-v4__heading">Contact</p>
            <p className="zg-footer-v4__contact">
              <a href="mailto:contact@zengrow.ch">contact@zengrow.ch</a>
            </p>
          </div>
        </div>

        <div className="zg-footer-v4__bottom">
          © 2026 ZenGrow. Tous droits réservés.
        </div>
      </Container>
    </footer>
  );
}
