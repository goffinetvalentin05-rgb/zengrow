"use client";

import { FEATURED_PERSON } from "../landing-people";
import { useLocale } from "../locale-provider";
import { Container, Section, SectionLead, SectionTitle } from "../ui";

export function ProfileSection() {
  const { t } = useLocale();
  const person = FEATURED_PERSON;

  return (
    <Section className="go-profile-section">
      <Container>
        <div className="go-explore">
          <div className="go-explore__copy">
            <SectionTitle>{t.profile.title}</SectionTitle>
            <SectionLead>{t.profile.text1}</SectionLead>
            <p className="go-lead go-profile-section__lead">{t.profile.text2}</p>
            <p className="go-profile-section__note">{t.profile.note}</p>
          </div>

          <div className="go-explore__visual">
            <article className="go-profile go-profile-public">
              <div className="go-profile__identity">
                <span className="go-profile__avatar" aria-hidden>
                  {person.initials}
                </span>
                <div>
                  <h3>{person.name}</h3>
                  <p className="go-profile__niche">{person.role}</p>
                  <p className="go-profile__loc">{person.location}</p>
                </div>
              </div>

              <p className="go-profile__activity">{person.project}</p>

              <div className="go-profile__grid">
                <div className="go-profile__block">
                  <p className="go-profile__label">Niche</p>
                  <p className="go-profile__value">{person.niche}</p>
                </div>
                <div className="go-profile__block">
                  <p className="go-profile__label">Audience</p>
                  <p className="go-profile__value">{person.audience}</p>
                </div>
              </div>

              <div className="go-profile__latest">
                <p className="go-profile__label">Lien public</p>
                <p className="go-profile__latest-title">sharpz.me/{person.username}</p>
                <div className="go-profile-public__platforms">
                  {person.platforms.map((platform) => (
                    <span key={platform}>{platform}</span>
                  ))}
                </div>
              </div>
            </article>
          </div>
        </div>
      </Container>
    </Section>
  );
}
