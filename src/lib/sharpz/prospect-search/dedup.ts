import type { Prospect } from "@/src/lib/sharpz/types";

export function normalizeDomain(value: string | null | undefined) {
  if (!value?.trim()) return null;
  try {
    const url = value.includes("://") ? value : `https://${value}`;
    const host = new URL(url).hostname.toLowerCase();
    return host.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function normalizeCompanyKey(value: string | null | undefined) {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function normalizePhone(value: string | null | undefined) {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  return digits.length >= 8 ? digits : null;
}

export function normalizeEmail(value: string | null | undefined) {
  const email = value?.trim().toLowerCase();
  if (!email || !email.includes("@")) return null;
  return email;
}

export type DedupIndex = {
  domains: Set<string>;
  companies: Set<string>;
  emails: Set<string>;
  phones: Set<string>;
};

export function buildDedupIndex(prospects: Prospect[]): DedupIndex {
  const domains = new Set<string>();
  const companies = new Set<string>();
  const emails = new Set<string>();
  const phones = new Set<string>();

  for (const item of prospects) {
    const domain = normalizeDomain(item.url);
    if (domain) domains.add(domain);
    const company = normalizeCompanyKey(item.company);
    if (company) companies.add(company);
    const email = normalizeEmail(item.email);
    if (email) emails.add(email);
    const phone = normalizePhone(item.phone);
    if (phone) phones.add(phone);
  }

  return { domains, companies, emails, phones };
}

export function isDuplicateCandidate(
  candidate: {
    company: string;
    url: string;
    email?: string | null;
    phone?: string | null;
  },
  index: DedupIndex,
) {
  const domain = normalizeDomain(candidate.url);
  if (domain && index.domains.has(domain)) return true;

  const company = normalizeCompanyKey(candidate.company);
  if (company && index.companies.has(company)) return true;

  const email = normalizeEmail(candidate.email);
  if (email && index.emails.has(email)) return true;

  const phone = normalizePhone(candidate.phone);
  if (phone && index.phones.has(phone)) return true;

  return false;
}

export function registerCandidate(
  candidate: {
    company: string;
    url: string;
    email?: string | null;
    phone?: string | null;
  },
  index: DedupIndex,
) {
  const domain = normalizeDomain(candidate.url);
  if (domain) index.domains.add(domain);
  const company = normalizeCompanyKey(candidate.company);
  if (company) index.companies.add(company);
  const email = normalizeEmail(candidate.email);
  if (email) index.emails.add(email);
  const phone = normalizePhone(candidate.phone);
  if (phone) index.phones.add(phone);
}

const SKIP_HOSTS = [
  "facebook.com",
  "instagram.com",
  "twitter.com",
  "x.com",
  "youtube.com",
  "linkedin.com",
  "wikipedia.org",
  "google.com",
  "apple.com",
  "play.google.com",
  "apps.apple.com",
];

const DIRECTORY_HOSTS = [
  "local.ch",
  "search.ch",
  "pagesjaunes.fr",
  "yelp.",
  "tripadvisor.",
  "crunchbase.com",
  "zoominfo.com",
];

export function shouldSkipSearchUrl(url: string) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (SKIP_HOSTS.some((item) => host === item || host.endsWith(`.${item}`))) return true;
    if (DIRECTORY_HOSTS.some((item) => host.includes(item))) return true;
    return false;
  } catch {
    return true;
  }
}

export function pickCanonicalWebsite(url: string) {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    parsed.search = "";
    if (parsed.pathname !== "/" && parsed.pathname.endsWith("/")) {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }
    return parsed.toString();
  } catch {
    return url;
  }
}
