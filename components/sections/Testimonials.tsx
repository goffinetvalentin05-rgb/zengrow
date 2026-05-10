"use client";

import { motion } from "framer-motion";
import { Reveal } from "@/components/sections/Reveal";

const people = [
  {
    name: "Camille Duval",
    role: "Propriétaire, Bistro Lumière · Genève",
    quote:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    highlight: false,
  },
  {
    name: "Marc Keller",
    role: "Manager, Maison Keller · Lausanne",
    quote:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    highlight: true,
  },
  {
    name: "Sofia Martins",
    role: "Cheffe, Mesa · Neuchâtel",
    quote:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.",
    highlight: false,
  },
];

export function Testimonials() {
  return (
    <section className="relative bg-landing-bg py-24 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_35%_at_50%_0%,rgba(255,107,44,0.08),transparent)]" />
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="font-landing-serif text-[clamp(2rem,4vw,3rem)] font-normal text-landing-fg">
            Ce que disent les <em className="italic text-landing-accent">restaurateurs</em>
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {people.map((p, i) => (
            <motion.figure
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i, duration: 0.55 }}
              className={`rounded-2xl border bg-landing-card/90 p-6 backdrop-blur-sm ${
                p.highlight
                  ? "border-landing-accent/55 shadow-[0_0_50px_-18px_rgba(255,107,44,0.55)]"
                  : "border-landing-border"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="size-11 shrink-0 rounded-full bg-gradient-to-br from-landing-accent/40 to-landing-accent-soft/25 ring-2 ring-landing-border"
                  aria-hidden
                />
                <div>
                  <figcaption className="text-sm font-semibold text-landing-fg">{p.name}</figcaption>
                  <p className="text-xs text-landing-muted">{p.role}</p>
                </div>
              </div>
              <blockquote className="mt-4 text-sm leading-relaxed text-landing-fg/90">&ldquo;{p.quote}&rdquo;</blockquote>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
