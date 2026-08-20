"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CTA, FAQ_ITEMS, PRICING_OFFERS, formatPrice } from "../config";
import { Container, CtaButton } from "../ui";
import { cn } from "@/src/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

export function OfferSection() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="fitme-offer" id="tarifs">
      <Container>
        <motion.div
          className="fitme-center"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease }}
        >
          <h2 className="fitme-display fitme-h2">
            Payez une fois. Gardez votre style.
          </h2>
          <p className="fitme-lead">
            Pas d’abonnement. Votre Style Profile reste à vous.
          </p>
        </motion.div>

        <div className="fitme-pricing">
          {PRICING_OFFERS.map((offer, index) => (
            <motion.article
              key={offer.id}
              className={cn("fitme-price-card", offer.featured && "is-featured")}
              initial={reduce ? false : { opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.08 + index * 0.14, ease }}
            >
              {offer.featured ? <p className="fitme-price-card__tag">Le plus complet</p> : null}
              <p className="fitme-price-card__plan">{offer.plan}</p>
              <p className="fitme-price-card__amount">{formatPrice(offer.price)}</p>
              <ul>
                {offer.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <CtaButton ghost={!offer.featured}>{offer.cta}</CtaButton>
            </motion.article>
          ))}
        </div>

        <div className="fitme-offer__faq" id="faq">
          <h3>Questions fréquentes</h3>
          <div className="fitme-faq">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = open === index;
              return (
                <div key={item.q} className={cn("fitme-faq__item", isOpen && "is-open")}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : index)}
                  >
                    <span className="fitme-faq__q">{item.q}</span>
                    <span className="fitme-faq__icon" aria-hidden />
                  </button>
                  <div className="fitme-faq__panel">
                    <div className="fitme-faq__inner">
                      <p>{item.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>

      <div className="fitme-final">
        <div className="fitme-final__wash" aria-hidden />
        <div className="fitme-final__grain" aria-hidden />
        <Container>
          <motion.div
            className="fitme-final__copy"
            initial={reduce ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.65, ease }}
          >
            <p className="fitme-final__eyebrow">
              Vous avez assez vu les styles sur les autres.
            </p>
            <p className="fitme-final__title">Découvrez le vôtre.</p>
            <CtaButton className="fitme-cta--on-warm">{CTA.primaryArrow}</CtaButton>
            <p className="fitme-fine">{CTA.finePrint}</p>
          </motion.div>
        </Container>
      </div>
    </section>
  );
}
