import { CTA, getSocialProofBadge } from "../config";
import { CtaButton } from "../ui";
import { HeroBackdrop } from "../components/HeroBackdrop";

export function HeroSection() {
  return (
    <section className="fitme-hero">
      <HeroBackdrop />

      <div className="fitme-hero__copy">
        <p className="fitme-pill">
          <span className="fitme-pill__dot" aria-hidden />
          {getSocialProofBadge()}
        </p>
        <h1 className="fitme-hero__title">
          <span className="fitme-hero__line">Le style que vous&nbsp;aimez</span>
          <span className="fitme-hero__line">n’est pas forcément</span>
          <span className="fitme-hero__line">celui qui vous va.</span>
        </h1>
        <p className="fitme-hero__lead">
          Découvrez les styles et les couleurs qui vous mettent vraiment en valeur.
        </p>
        <div className="fitme-hero__cta">
          <CtaButton>{CTA.primary}</CtaButton>
          <p className="fitme-fine">{CTA.finePrint}</p>
        </div>
      </div>
    </section>
  );
}
