import type { Prospect, ProspectStatus } from "@/src/lib/sharpz/types";

export const SCRIPT_CHANNELS = ["whatsapp", "linkedin", "instagram", "email", "phone"] as const;
export type ScriptChannel = (typeof SCRIPT_CHANNELS)[number];

export const SCRIPT_STAGES = [
  "first_contact",
  "follow_up_1",
  "follow_up_2",
  "in_discussion",
  "closing",
  "custom",
] as const;
export type ScriptStage = (typeof SCRIPT_STAGES)[number];

export const SCRIPT_VARIABLES = [
  "first_name",
  "last_name",
  "company",
  "website",
  "saas_name",
  "offer",
] as const;
export type ScriptVariable = (typeof SCRIPT_VARIABLES)[number];

export type ProspectScript = {
  id: string;
  restaurantId: string;
  name: string;
  channel: ScriptChannel;
  stage: ScriptStage;
  content: string;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ScriptVariableValues = Partial<Record<ScriptVariable, string | null | undefined>>;

export type OutreachSaasContext = {
  name: string | null;
  url: string | null;
  description: string | null;
  pricingSummary: string | null;
  objectiveKey: string | null;
  objectiveCustomLabel: string | null;
};

export function isScriptChannel(value: string): value is ScriptChannel {
  return (SCRIPT_CHANNELS as readonly string[]).includes(value);
}

export function isScriptStage(value: string): value is ScriptStage {
  return (SCRIPT_STAGES as readonly string[]).includes(value);
}

export function pipelineStatusToScriptStage(status: ProspectStatus | string): ScriptStage {
  if (status === "follow_up_1") return "follow_up_1";
  if (status === "follow_up_2") return "follow_up_2";
  if (status === "in_discussion") return "in_discussion";
  if (status === "qualified" || status === "customer") return "closing";
  if (status === "closed") return "custom";
  return "first_contact";
}

export function splitPersonName(name: string | null | undefined) {
  const raw = name?.trim() ?? "";
  if (!raw) return { firstName: "", lastName: "" };
  const parts = raw.split(/\s+/);
  return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
}

export function scriptVarsFromProspect(
  prospect: Pick<Prospect, "type" | "name" | "contact" | "company" | "url">,
  saas: Pick<OutreachSaasContext, "name" | "pricingSummary"> | null,
): ScriptVariableValues {
  const person = splitPersonName(prospect.name || (prospect.type === "individual" ? prospect.contact : null));
  return {
    first_name: person.firstName || null,
    last_name: person.lastName || null,
    company: prospect.company?.trim() || null,
    website: prospect.url?.trim() || null,
    saas_name: saas?.name?.trim() || null,
    offer: saas?.pricingSummary?.trim() || null,
  };
}

/** Remplace uniquement les variables dont la valeur est connue. Ne jamais inventer. */
export function interpolateScript(content: string, vars: ScriptVariableValues) {
  return content.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (full, key: string) => {
    const normalized = key.toLowerCase() as ScriptVariable;
    const value = vars[normalized];
    if (typeof value === "string" && value.trim()) return value.trim();
    return full;
  });
}

export function phoneDigits(phone: string | null | undefined) {
  if (!phone) return "";
  const trimmed = phone.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return "";
  if (hasPlus) return digits;
  if (digits.startsWith("00") && digits.length > 4) return digits.slice(2);
  return digits;
}

export function whatsappHref(phone: string | null | undefined, text?: string | null) {
  const digits = phoneDigits(phone);
  if (digits.length < 8) return null;
  const base = `https://wa.me/${digits}`;
  const message = text?.trim();
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

export function telHref(phone: string | null | undefined) {
  const digits = phoneDigits(phone);
  if (digits.length < 6) return null;
  const original = phone?.trim() ?? "";
  const href = original.startsWith("+") ? `+${digits}` : digits;
  return `tel:${href}`;
}

export function mailtoHref(email: string | null | undefined, body?: string | null, subject?: string | null) {
  const address = email?.trim();
  if (!address || !address.includes("@")) return null;
  const params = new URLSearchParams();
  if (subject?.trim()) params.set("subject", subject.trim());
  if (body?.trim()) params.set("body", body.trim());
  const query = params.toString();
  return query ? `mailto:${address}?${query}` : `mailto:${address}`;
}

export function ensureHttpUrl(value: string | null | undefined) {
  const raw = value?.trim();
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("//")) return `https:${raw}`;
  return `https://${raw}`;
}

function hostOf(url: string) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

export function linkedinHref(linkedinUrl: string | null | undefined, website?: string | null) {
  const dedicated = ensureHttpUrl(linkedinUrl);
  if (dedicated && hostOf(dedicated).includes("linkedin.com")) return dedicated;
  const fromSite = ensureHttpUrl(website);
  if (fromSite && hostOf(fromSite).includes("linkedin.com")) return fromSite;
  return dedicated;
}

export function instagramHref(instagramUrl: string | null | undefined, website?: string | null) {
  const dedicated = ensureHttpUrl(instagramUrl);
  if (dedicated && hostOf(dedicated).includes("instagram.com")) return dedicated;
  const fromSite = ensureHttpUrl(website);
  if (fromSite && hostOf(fromSite).includes("instagram.com")) return fromSite;
  return dedicated;
}

export function availableOutreachChannels(prospect: {
  email?: string | null;
  phone?: string | null;
  url?: string | null;
  linkedinUrl?: string | null;
  instagramUrl?: string | null;
}): ScriptChannel[] {
  const channels: ScriptChannel[] = [];
  if (whatsappHref(prospect.phone)) channels.push("whatsapp");
  if (mailtoHref(prospect.email)) channels.push("email");
  if (linkedinHref(prospect.linkedinUrl, prospect.url)) channels.push("linkedin");
  if (instagramHref(prospect.instagramUrl, prospect.url)) channels.push("instagram");
  if (telHref(prospect.phone)) channels.push("phone");
  return channels;
}

export function pickScript(
  scripts: ProspectScript[],
  channel: ScriptChannel,
  stage: ScriptStage,
) {
  const active = scripts.filter((item) => item.isActive && item.channel === channel);
  return active.find((item) => item.stage === stage) ?? active[0] ?? null;
}

export function followUpIso(daysFromNow: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(12, 0, 0, 0);
  return date.toISOString();
}

export function followUpIsoFromDateInput(value: string) {
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12, 0, 0, 0);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function mapProspectScript(row: Record<string, unknown>): ProspectScript {
  return {
    id: String(row.id),
    restaurantId: String(row.restaurant_id ?? ""),
    name: String(row.name ?? ""),
    channel: isScriptChannel(String(row.channel)) ? (row.channel as ScriptChannel) : "whatsapp",
    stage: isScriptStage(String(row.stage)) ? (row.stage as ScriptStage) : "custom",
    content: String(row.content ?? ""),
    notes: typeof row.notes === "string" ? row.notes : null,
    isActive: row.is_active !== false,
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? row.created_at ?? ""),
  };
}

export const DEFAULT_PROSPECT_SCRIPTS: Array<{
  name: string;
  channel: ScriptChannel;
  stage: ScriptStage;
  content: string;
  notes: string;
}> = [
  {
    name: "Premier contact — WhatsApp",
    channel: "whatsapp",
    stage: "first_contact",
    notes: "Message court, une seule question.",
    content:
      "Bonjour {{first_name}}, je me permets de vous contacter au sujet de {{company}}. Nous aidons des équipes comme la vôtre avec {{saas_name}} ({{offer}}). Auriez-vous 10 minutes cette semaine pour en parler ?",
  },
  {
    name: "Relance 1 — WhatsApp",
    channel: "whatsapp",
    stage: "follow_up_1",
    notes: "Relance courte, sans pression.",
    content:
      "Bonjour {{first_name}}, je me permets de revenir vers vous concernant {{company}}. Souhaitez-vous que je vous envoie une courte présentation de {{saas_name}} ?",
  },
  {
    name: "Relance 2 — WhatsApp",
    channel: "whatsapp",
    stage: "follow_up_2",
    notes: "Dernière relance douce.",
    content:
      "Bonjour {{first_name}}, un dernier message de ma part au sujet de {{company}}. Si le timing n’est pas le bon, dites-le-moi et je reviendrai plus tard.",
  },
  {
    name: "Premier contact — LinkedIn",
    channel: "linkedin",
    stage: "first_contact",
    notes: "Note de connexion / premier message.",
    content:
      "Bonjour {{first_name}}, j’ai vu {{company}} et je me suis permis de vous écrire. {{saas_name}} aide des équipes similaires sur {{offer}}. Seriez-vous ouvert à un échange rapide ?",
  },
  {
    name: "Relance 1 — LinkedIn",
    channel: "linkedin",
    stage: "follow_up_1",
    notes: "Relance LinkedIn.",
    content:
      "Bonjour {{first_name}}, je me permets de relancer mon message précédent concernant {{company}}. Si ce n’est pas prioritaire, aucun souci — je peux revenir plus tard.",
  },
  {
    name: "Premier contact — Email",
    channel: "email",
    stage: "first_contact",
    notes: "Email de prise de contact.",
    content:
      "Bonjour {{first_name}},\n\nJe me permets de vous écrire au sujet de {{company}}. {{saas_name}} aide des équipes comme la vôtre avec {{offer}}.\n\nSeriez-vous disponible pour un court échange cette semaine ?\n\nBien à vous",
  },
  {
    name: "Script appel découverte",
    channel: "phone",
    stage: "first_contact",
    notes: "À lire pendant l’appel. Ne pas inventer de chiffres.",
    content:
      "Objectif : comprendre si {{company}} a un besoin autour de {{offer}}.\n\nOuverture : Bonjour {{first_name}}, je vous contacte de la part de {{saas_name}}.\n\nQuestions :\n1. Comment gérez-vous ce sujet aujourd’hui ?\n2. Qu’est-ce qui vous prend le plus de temps ?\n3. Qu’est-ce qui devrait changer dans les 90 prochains jours ?\n\nSi le besoin est réel : proposer un créneau de démo. Sinon : remercier et classer.",
  },
  {
    name: "Script appel closing",
    channel: "phone",
    stage: "closing",
    notes: "Closing — s’appuyer uniquement sur ce qui a déjà été dit.",
    content:
      "Rappel du contexte : échange avec {{first_name}} ({{company}}) autour de {{saas_name}}.\n\n1. Résumer le besoin exprimé — uniquement ce qui a été dit.\n2. Confirmer la proposition : {{offer}}.\n3. Clarifier la prochaine étape (essai, démo, décision).\n4. Si hésitation : demander l’objection réelle, sans inventer de preuve sociale.",
  },
];
