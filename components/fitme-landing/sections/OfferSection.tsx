"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CTA, FAQ_ITEMS } from "../config";
import { Container, CtaButton } from "../ui";
import { cn } from "@/src/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

export function OfferSection() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="fitme-offer">
      <Container>
        <div className="fitme-offer__faq" id="faq">
          <h2>Questions fréquentes</h2>
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
        <div className="fitme-final__vignette" aria-hidden />
        <div className="fitme-final__grain" aria-hidden />
        <div className="fitme-final__fade" aria-hidden />
        <Container>
          <motion.div
            className="fitme-final__copy"
            initial={reduce ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.65, ease }}
          >
            <h2 className="fitme-final__title">
              Prêt à découvrir ce qui vous va vraiment ?
            </h2>
            <p className="fitme-final__lead">
              Créez votre Style Profile et découvrez les univers et les couleurs
              qui vous mettent le plus en valeur.
            </p>
            <CtaButton className="fitme-cta--on-dark">{CTA.primary}</CtaButton>
            <p className="fitme-fine">{CTA.noSubscription}</p>
            <p className="fitme-final__note">{CTA.paywallNote}</p>
          </motion.div>
        </Container>
      </div>
    </section>
  );
}
