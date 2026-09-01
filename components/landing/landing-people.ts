import { DISCOVERY_SEED_PROFILES } from "@/src/lib/discovery/seed-data";

export type LandingPerson = {
  name: string;
  username: string;
  role: string;
  niche: string;
  location: string;
  project: string;
  audience: string;
  platforms: string[];
  initials: string;
};

function formatAudience(size: number) {
  if (size >= 1000) return `${(size / 1000).toFixed(size >= 10000 ? 0 : 1).replace(".0", "")}k`;
  return String(size);
}

export const LANDING_PEOPLE: LandingPerson[] = DISCOVERY_SEED_PROFILES.map((profile) => ({
  name: profile.name,
  username: profile.username,
  role: profile.role,
  niche: profile.project.category,
  location: profile.location,
  project: profile.project.name,
  audience: formatAudience(profile.audience),
  platforms: profile.links.map((link) => link.platform),
  initials: profile.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2),
}));

function byUsername(username: string) {
  return LANDING_PEOPLE.find((person) => person.username === username) ?? LANDING_PEOPLE[0];
}

export const HERO_PEOPLE = [
  byUsername("mayachen"),
  byUsername("jonashale"),
  byUsername("priyashah"),
  byUsername("elisemoreau"),
];

export const FEATURED_PERSON = byUsername("elisemoreau");
