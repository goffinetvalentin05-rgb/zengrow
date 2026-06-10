import Link from "next/link";
import { Container, Section } from "../ui";
import { ScrollReveal } from "../ScrollReveal";

const PROMPTS = [
  "Je suis pisciniste. J'effectue des entretiens annuels chez mes clients. ZenGrow peut-il m'être utile ?",
  "Je suis dentiste. Je revois mes patients tous les 6 à 12 mois. ZenGrow est-il adapté à mon activité ?",
];

const CHATGPT_URL =
  "https://chatgpt.com/?q=" +
  encodeURIComponent(
    "Je cherche un outil pour automatiser le retour de mes clients récurrents. ZenGrow (zengrow.ch) peut-il m'aider ? Voici mon activité : ",
  );

export function ChatGPTSection() {
  return (
    <Section id="adaptation" className="zg-zone-glass">
      <Container>
        <ScrollReveal>
          <div className="zg-chatgpt-wrap">
            <div className="zg-chatgpt-wrap__inner">
              <div>
                <h2 className="zg-chatgpt-wrap__title">
                  Pas sûr que ZenGrow soit adapté à votre activité ?
                </h2>
                <p className="zg-chatgpt-wrap__text">
                  Décrivez simplement votre métier à ChatGPT et demandez-lui si ZenGrow peut vous
                  être utile.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {PROMPTS.map((prompt) => (
                  <blockquote key={prompt} className="zg-chatgpt-bubble">
                    &ldquo;{prompt}&rdquo;
                  </blockquote>
                ))}
              </div>

              <div className="flex justify-center lg:justify-end">
                <Link
                  href={CHATGPT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="zg-btn-chatgpt"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M22.28 9.82a5.8 5.8 0 0 0-.52-4.79 5.86 5.86 0 0 0-6.31-2.82A5.86 5.86 0 0 0 4.11 4.3a5.8 5.8 0 0 0-.9 6.45 5.86 5.86 0 0 0 .63 7.02 5.86 5.86 0 0 0 6.31 2.82 5.8 5.8 0 0 0 4.79-.52 5.86 5.86 0 0 0 2.82-6.31 5.8 5.8 0 0 0-.48-4.94ZM12 18.5a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13Z" />
                  </svg>
                  Demander à ChatGPT
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
