export type ProspectSearchCriteria = {
  count: number;
  targetDescription: string;
  industry: string | null;
  location: string | null;
  keywords: string[];
  exclusions: string[];
  referenceCompany: string | null;
  onlyNeverContacted: boolean;
};

export type SourcedField<T = string> = {
  value: T;
  sourceUrl: string;
};

export type RawSearchHit = {
  title: string;
  url: string;
  snippet: string | null;
  sourceQuery: string;
};

export type ExtractedProspectContact = {
  officialName: string | null;
  description: string | null;
  city: string | null;
  country: string | null;
  website: string;
  email: SourcedField | null;
  phone: SourcedField | null;
  linkedinUrl: SourcedField | null;
  instagramUrl: SourcedField | null;
  contactPageUrl: string | null;
};

export type ScoredProspectCandidate = {
  company: string;
  name: string | null;
  url: string;
  sourceUrl: string;
  location: string | null;
  email: string | null;
  emailSourceUrl: string | null;
  phone: string | null;
  phoneSourceUrl: string | null;
  linkedinUrl: string | null;
  instagramUrl: string | null;
  whyFit: string;
  fitScore: number;
  notes: string | null;
};

export type ProspectSearchResult = {
  reply: string;
  prospects: ScoredProspectCandidate[];
  requested: number;
  found: number;
  duplicatesRemoved: number;
  queries: string[];
  provider: string;
};

export type ProspectSearchErrorCode =
  | "not_configured"
  | "provider_error"
  | "no_results"
  | "extraction_failed";

export class ProspectSearchError extends Error {
  code: ProspectSearchErrorCode;
  retryable: boolean;

  constructor(message: string, code: ProspectSearchErrorCode, retryable = true) {
    super(message);
    this.name = "ProspectSearchError";
    this.code = code;
    this.retryable = retryable;
  }
}
