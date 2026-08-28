"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { LANDING_LOGO } from "../BrandLogo";
import { useLocale } from "../locale-provider";
import { Container } from "../ui";

const EASE = [0.22, 1, 0.36, 1] as const;
const MARK_SLOTS = ["nw", "ne", "sw", "se", "e"] as const;

export function FinalCtaSection() {
  const { t } = useLocale();
  const reduce = Boolean(useReducedMotion());

  return (
    <section id="start" className="go-sign" aria-label="Sharpz">
      <Container wide>
        <div className="go-sign__stage">
          <span className="go-sign__mist go-sign__mist--a" aria-hidden />
          <span className="go-sign__mist go-sign__mist--b" aria-hidden />
          <span className="go-sign__mist go-sign__mist--c" aria-hidden />
          <span className="go-sign__mist go-sign__mist--d" aria-hidden />

          <motion.div
            className="go-sign__brand"
            initial={
              reduce ? false : { opacity: 0, y: 32, filter: "blur(10px)", scale: 0.98 }
            }
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1.05, ease: EASE }}
          >
            <Image
              src={LANDING_LOGO.src}
              alt="Sharpz"
              width={LANDING_LOGO.width}
              height={LANDING_LOGO.height}
              className="go-sign__logo"
              sizes="(min-width: 1100px) 56rem, 92vw"
            />
          </motion.div>

          <div className="go-sign__marks">
            {t.sign.marks.map((mark, index) => (
              <motion.span
                key={mark}
                className={`go-sign__mark go-sign__mark--${MARK_SLOTS[index]}`}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, delay: 0.42 + index * 0.1, ease: EASE }}
              >
                {mark}
              </motion.span>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
