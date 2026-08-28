import {
  availableOutreachChannels,
  followUpIso,
  interpolateScript,
  linkedinHref,
  mailtoHref,
  pickScript,
  pipelineStatusToScriptStage,
  scriptVarsFromProspect,
  whatsappHref,
  type OutreachSaasContext,
  type ProspectScript,
  type ScriptChannel,
} from "@/src/lib/sharpz/outreach";
import type { Prospect, ProspectStatus } from "@/src/lib/sharpz/types";

const EXCLUDED_FOLLOW_UP_STATUSES = new Set<ProspectStatus | string>(["customer", "closed"]);

/** Signal growth réutilisable : Dashboard, notifications futures, Agent Orion. */
export type GrowthSignalKind = "prospect_follow_up_due";

export type GrowthSignal = {
  kind: GrowthSignalKind;
  id: string;
  title: string;
  detail: string;
  count: number;
  prospectIds: string[];
  href: string;
  createdAt: string;
};

export type DueFollowUpItem = {
  id: string;
  name: string | null;
  company: string;
  status: string;
  contactedAt: string | null;
  lastAction: string | null;
  nextFollowUpAt: string;
  daysSinceContact: number | null;
  channels: ScriptChannel[];
  recommendedChannel: ScriptChannel | null;
  recommendedScript: {
    id: string;
    name: string;
    channel: ScriptChannel;
    content: string;
  } | null;
  whatsappUrl: string | null;
  emailUrl: string | null;
  linkedinUrl: string | null;
};

function startOfLocalDay(value: Date) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

/** Relance due si next_follow_up_at est aujourd’hui ou en retard (jour local). */
export function isFollowUpDue(iso: string | null | undefined, now = new Date()) {
  if (!iso) return false;
  const due = startOfLocalDay(new Date(iso));
  if (Number.isNaN(due.getTime())) return false;
  return due.getTime() <= startOfLocalDay(now).getTime();
}

export function isEligibleForFollowUpReminder(status: string) {
  return !EXCLUDED_FOLLOW_UP_STATUSES.has(status);
}

export function selectDueFollowUps(prospects: Prospect[], now = new Date()): Prospect[] {
  return prospects
    .filter(
      (item) =>
        isEligibleForFollowUpReminder(item.status) &&
        isFollowUpDue(item.nextFollowUpAt, now),
    )
    .sort((a, b) => {
      const aTime = a.nextFollowUpAt ? new Date(a.nextFollowUpAt).getTime() : 0;
      const bTime = b.nextFollowUpAt ? new Date(b.nextFollowUpAt).getTime() : 0;
      return aTime - bTime;
    });
}

export function daysSinceLastContact(prospect: Pick<Prospect, "contactedAt" | "updatedAt">, now = new Date()) {
  const raw = prospect.contactedAt;
  if (!raw) return null;
  const contacted = new Date(raw);
  if (Number.isNaN(contacted.getTime())) return null;
  const ms = startOfLocalDay(now).getTime() - startOfLocalDay(contacted).getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

/** Progression pipeline après une relance effectuée. */
export function nextStatusAfterFollowUp(status: string): ProspectStatus | string {
  if (status === "to_contact") return "follow_up_1";
  if (status === "follow_up_1") return "follow_up_2";
  return status;
}

export function defaultNextFollowUpAfterContact(daysFromNow = 3) {
  return followUpIso(daysFromNow);
}

export function buildFollowUpGrowthSignal(
  due: Prospect[],
  href = "/dashboard#today-follow-ups",
): GrowthSignal | null {
  if (!due.length) return null;
  const count = due.length;
  return {
    kind: "prospect_follow_up_due",
    id: `growth-followups-${count}`,
    title: count === 1 ? "Relancer 1 prospect" : `Relancer ${count} prospects`,
    detail:
      count === 1
        ? due[0]?.name?.trim() || due[0]?.company || "Relance due aujourd’hui"
        : `${count} relances dues aujourd’hui (next_follow_up_at).`,
    count,
    prospectIds: due.map((item) => item.id),
    href,
    createdAt: new Date().toISOString(),
  };
}

function pickRecommendedChannel(channels: ScriptChannel[]): ScriptChannel | null {
  const order: ScriptChannel[] = ["whatsapp", "email", "linkedin", "phone", "instagram"];
  return order.find((channel) => channels.includes(channel)) ?? null;
}

export function enrichDueFollowUps(
  due: Prospect[],
  scripts: ProspectScript[],
  saas: OutreachSaasContext | null,
): DueFollowUpItem[] {
  return due.map((prospect) => {
    const channels = availableOutreachChannels(prospect);
    const recommendedChannel = pickRecommendedChannel(channels);
    const stage = pipelineStatusToScriptStage(prospect.status);
    const script =
      recommendedChannel != null ? pickScript(scripts, recommendedChannel, stage) : null;
    const content = script
      ? interpolateScript(script.content, scriptVarsFromProspect(prospect, saas))
      : null;

    return {
      id: prospect.id,
      name: prospect.name,
      company: prospect.company,
      status: prospect.status,
      contactedAt: prospect.contactedAt,
      lastAction: prospect.lastAction,
      nextFollowUpAt: prospect.nextFollowUpAt as string,
      daysSinceContact: daysSinceLastContact(prospect),
      channels,
      recommendedChannel,
      recommendedScript:
        script && content
          ? {
              id: script.id,
              name: script.name,
              channel: script.channel,
              content,
            }
          : null,
      whatsappUrl: whatsappHref(prospect.phone, content),
      emailUrl: mailtoHref(prospect.email, content, saas?.name ? `${saas.name}` : null),
      linkedinUrl: linkedinHref(prospect.linkedinUrl, prospect.url),
    };
  });
}
