"use client";

import { useState } from "react";
import { useLocale } from "../locale-provider";
import { Container, Eyebrow, ScrollReveal, Section, SectionLead, SectionTitle } from "../ui";

export function DiscoverSection() {
  const { t } = useLocale();
  const [niche, setNiche] = useState(0);
  const [filter, setFilter] = useState(2);

  return (
    <Section id="explore">
      <Container>
        <ScrollReveal className="go-section-head">
          <Eyebrow>{t.discover.label}</Eyebrow>
          <SectionTitle>{t.discover.title}</SectionTitle>
          <SectionLead>{t.discover.subtitle}</SectionLead>
        </ScrollReveal>

        <ScrollReveal className="go-discover" y={22}>
          <div className="go-discover__niches" id="categories">
            <span className="go-discover__niches-label">{t.discover.categoryLabel}</span>
            <div className="go-discover__niches-track" role="tablist" aria-label={t.discover.categoryLabel}>
              {t.discover.niches.map((item, index) => (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={index === niche}
                  className={index === niche ? "is-on" : undefined}
                  onClick={() => setNiche(index)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="go-discover__bar">
            <div className="go-discover__filters" aria-label="Filters">
              {t.discover.filters.map((item, index) => (
                <button
                  key={item}
                  type="button"
                  className={index === filter ? "is-on" : undefined}
                  onClick={() => setFilter(index)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="go-discover__grid">
            {t.discover.profiles.map((profile) => (
              <article key={profile.name} className="go-person">
                <div className="go-person__head">
                  <span className="go-person__avatar" aria-hidden>
                    {profile.initials}
                  </span>
                  <div>
                    <h3>{profile.name}</h3>
                    <p>{profile.role}</p>
                  </div>
                  <span className="go-person__badge">{profile.badge}</span>
                </div>
                <div className="go-person__facts">
                  <div>
                    <span className="go-person__fact-label">{t.discover.projectLabel}</span>
                    <span className="go-person__fact-value">{profile.project}</span>
                  </div>
                  <div>
                    <span className="go-person__fact-label">{t.discover.followersLabel}</span>
                    <span className="go-person__metric" data-placeholder="true">
                      {profile.followers}
                    </span>
                  </div>
                </div>
                <div className="go-person__platforms">
                  {profile.platforms.map((platform) => (
                    <span key={platform}>{platform}</span>
                  ))}
                </div>
                <span className="go-person__cta">{t.discover.viewProfile}</span>
              </article>
            ))}
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
