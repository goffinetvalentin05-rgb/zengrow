import Image from "next/image";
import { CTA, IMAGES, getSocialProofBadge } from "../config";
import { CtaButton } from "../ui";

export function HeroSection() {
  return (
    <section className="fitme-hero">
      <div className="fitme-hero__stage" aria-hidden>
        <Image
          className="fitme-hero__photo"
          src={IMAGES.heroEditorial}
          alt=""
          fill
          priority
          quality={75}
          sizes="100vw"
        />
        <div className="fitme-hero__bloom" />
        <div className="fitme-hero__wash" />
        <div className="fitme-hero__shade" />
        <div className="fitme-hero__grain" />
        <div className="fitme-hero__veil" />
      </div>

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
