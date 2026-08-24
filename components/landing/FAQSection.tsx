"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { FAQ_ITEMS } from "./config";
import { Container, ScrollReveal } from "./ui";

export function FAQSection() {
  return (
    <section id="faq" className="go-faq-section" aria-labelledby="go-faq-title">
      <Container>
        <div className="go-faq-layout">
          <ScrollReveal>
            <div className="go-faq-intro">
              <p className="go-faq-label">FAQ</p>
              <h2 id="go-faq-title">Encore une question ?</h2>
              <p>Tout ce qu’il faut savoir avant de commencer avec ZifTip.</p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.06}>
            <Accordion.Root type="single" collapsible className="go-faq">
              {FAQ_ITEMS.map((item) => (
                <Accordion.Item key={item.q} value={item.q} className="go-faq__item">
                  <Accordion.Header asChild>
                    <h3 className="go-faq__heading">
                      <Accordion.Trigger className="go-faq__trigger">
                        <span>{item.q}</span>
                        <span className="go-faq__icon" aria-hidden />
                      </Accordion.Trigger>
                    </h3>
                  </Accordion.Header>
                  <Accordion.Content className="go-faq__content">
                    <p>{item.a}</p>
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
