import Link from "next/link";
import { CONTACT_EMAIL, PRODUCT, ROUTES } from "../config";
import { Container } from "../ui";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="fitme-footer">
      <Container>
        <div className="fitme-footer__row">
          <Link href={ROUTES.home} className="fitme-wordmark" aria-label={`${PRODUCT.name} — accueil`}>
            <span className="fitme-wordmark__dot" aria-hidden />
            {PRODUCT.name}
          </Link>
          <nav aria-label="Pied de page">
            <Link href={ROUTES.privacy}>Confidentialité</Link>
            <Link href={ROUTES.terms}>CGU</Link>
            <a href={`mailto:${CONTACT_EMAIL}`}>Contact</a>
            <Link href={ROUTES.login}>Connexion</Link>
          </nav>
        </div>
        <p className="fitme-footer__copy">
          © {year} {PRODUCT.name}. Tous droits réservés.
        </p>
      </Container>
    </footer>
  );
}
