/**
 * E2E P0.1 contre l’environnement déployé (Vercel Production / Preview).
 *
 * Les secrets serveur (OPENAI, SERVICE_ROLE, TAVILY…) restent UNIQUEMENT sur Vercel.
 * Ce script n’en lit aucun et n’en loggue aucun.
 *
 * Usage :
 *   set E2E_BASE_URL=https://votre-app.vercel.app
 *   set E2E_COOKIE=<Cookie navigateur après login sur cette URL>
 *   npx tsx scripts/e2e-agent-p01-live.ts
 *
 * Auth alternative (clés publiques OK) :
 *   E2E_BASE_URL + E2E_EMAIL + E2E_PASSWORD
 *   (+ NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY déjà publics)
 *
 * Options :
 *   E2E_PERSIST=1  → valide aussi les POST/PATCH de confirmation (actions, followups, experiments)
 */

import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

type AssistantResponse = {
  error?: string;
  reply?: string;
  prospects?: Array<{ company?: string; email?: string | null; phone?: string | null }>;
  proposedActions?: Array<{ title?: string; score?: number; category?: string }>;
  proposedFollowUps?: Array<{ prospectId?: string; company?: string; nextFollowUpAt?: string; daysFromNow?: number }>;
  proposedExperiments?: Array<{ hypothesis?: string }>;
  proposedProspects?: Array<{ company?: string }>;
  meta?: { toolsCalled?: string[]; capability?: string; model?: string };
  capability?: string;
  searchError?: { message?: string; retryable?: boolean };
};

type ScenarioResult = {
  id: string;
  message: string;
  httpStatus: number;
  toolsCalled: string[];
  capability?: string;
  replyPreview: string;
  persistence?: string;
  verdict: "✅" | "🟠" | "🔴";
  notes: string;
};

function loadPublicEnvOnly() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  const allowed = new Set([
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SITE_URL",
    "E2E_BASE_URL",
    "E2E_COOKIE",
    "E2E_EMAIL",
    "E2E_PASSWORD",
    "E2E_PERSIST",
  ]);
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 0) continue;
    const key = line.slice(0, i).trim();
    if (!allowed.has(key)) continue;
    let value = line.slice(i + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function preview(text: string | undefined, max = 160) {
  const clean = (text ?? "").replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max)}…` : clean;
}

function assertNoSecretLeak(payload: string) {
  const lower = payload.toLowerCase();
  const forbidden = ["sk-", "eyj", "service_role", "bearer "];
  // Soft check on our own console output shape — never print raw env.
  if (forbidden.some((f) => lower.includes(f) && lower.includes("api_key"))) {
    throw new Error("Refus d’afficher une sortie potentiellement sensible.");
  }
}

async function resolveCookieHeader(): Promise<string> {
  const cookie = process.env.E2E_COOKIE?.trim();
  if (cookie) return cookie;

  const email = process.env.E2E_EMAIL?.trim();
  const password = process.env.E2E_PASSWORD?.trim();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!email || !password) {
    throw new Error(
      "Auth manquante : fournissez E2E_COOKIE (recommandé) ou E2E_EMAIL + E2E_PASSWORD.",
    );
  }
  if (!url || !anon) {
    throw new Error(
      "Pour le login email/password, NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont requis (clés publiques).",
    );
  }

  const supabase = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    throw new Error(`Login Supabase échoué : ${error?.message ?? "session absente"}`);
  }

  const host = new URL(url).hostname.split(".")[0];
  const cookieName = `sb-${host}-auth-token`;
  const sessionPayload = {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at,
    expires_in: data.session.expires_in,
    token_type: data.session.token_type,
    user: data.session.user,
  };
  return `${cookieName}=${encodeURIComponent(JSON.stringify(sessionPayload))}`;
}

async function callAssistant(baseUrl: string, cookie: string, message: string): Promise<{
  status: number;
  data: AssistantResponse;
}> {
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/sharpz/assistant`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: message }],
    }),
  });

  const data = (await response.json().catch(() => ({}))) as AssistantResponse;
  return { status: response.status, data };
}

async function persistAction(
  baseUrl: string,
  cookie: string,
  action: NonNullable<AssistantResponse["proposedActions"]>[number],
) {
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/sharpz/actions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      actions: [
        {
          title: action.title,
          category: action.category ?? "acquisition",
          impact: 7,
          effort: 5,
          confidence: 70,
          why: "E2E P0.1",
        },
      ],
    }),
  });
  return response.status;
}

async function persistExperiment(
  baseUrl: string,
  cookie: string,
  experiment: NonNullable<AssistantResponse["proposedExperiments"]>[number],
) {
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/sharpz/experiments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ hypothesis: experiment.hypothesis }),
  });
  return response.status;
}

async function persistFollowUp(
  baseUrl: string,
  cookie: string,
  followUp: NonNullable<AssistantResponse["proposedFollowUps"]>[number],
) {
  if (!followUp.prospectId) return 400;
  const response = await fetch(
    `${baseUrl.replace(/\/$/, "")}/api/sharpz/prospects/${followUp.prospectId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ nextFollowUpAt: followUp.nextFollowUpAt }),
    },
  );
  return response.status;
}

function judge(scenarioId: string, status: number, data: AssistantResponse): Pick<ScenarioResult, "verdict" | "notes"> {
  if (status === 401 || status === 403) {
    return { verdict: "🔴", notes: "Auth refusée — Cookie / session invalide sur cette URL Vercel." };
  }
  if (status === 503) {
    return { verdict: "🔴", notes: "IA non configurée sur Vercel (OPENAI_API_KEY manquante côté serveur)." };
  }
  if (status >= 500) {
    return { verdict: "🔴", notes: data.error ?? `HTTP ${status}` };
  }
  if (status >= 400) {
    return { verdict: "🔴", notes: data.error ?? `HTTP ${status}` };
  }

  const tools = data.meta?.toolsCalled ?? [];
  const capability = data.capability ?? data.meta?.capability;
  const reply = (data.reply ?? "").toLowerCase();

  switch (scenarioId) {
    case "search_prospects":
      if (!tools.includes("search_prospects") && capability !== "prospect_search_not_connected") {
        return { verdict: "🟠", notes: "Réponse OK mais tool search_prospects non listé dans meta.toolsCalled." };
      }
      if (capability === "prospect_search_not_connected") {
        return { verdict: "🟠", notes: "not_configured honnête — provider search absent sur Vercel." };
      }
      if ((data.prospects?.length ?? 0) > 0) {
        const inventedContact = data.prospects!.some((p) => !p.company?.trim());
        if (inventedContact) return { verdict: "🔴", notes: "Prospect sans company." };
        return { verdict: "✅", notes: `${data.prospects!.length} prospect(s) proposés (pas d’insert auto).` };
      }
      return { verdict: "🟠", notes: "Tool appelé mais 0 prospect (source vide / erreur). Vérifier searchError." };

    case "create_action":
      if (!tools.includes("create_action") && !(data.proposedActions?.length)) {
        return { verdict: "🟠", notes: "Pas de proposedActions / tool non listé." };
      }
      if (data.proposedActions?.[0]?.score == null) {
        return { verdict: "🟠", notes: "Action proposée sans score Sharpz visible." };
      }
      return { verdict: "✅", notes: "Action proposée (confirmation requise)." };

    case "schedule_followup":
      if (reply.includes("quel") || reply.includes("précis") || reply.includes("lequel")) {
        return { verdict: "✅", notes: "Orion demande quel prospect (pas de choix aléatoire)." };
      }
      if (data.proposedFollowUps?.length) {
        return { verdict: "✅", notes: "Relance proposée avec date." };
      }
      if (tools.includes("schedule_followup")) {
        return { verdict: "🟠", notes: "Tool appelé sans proposedFollowUps — vérifier résolution prospect." };
      }
      return { verdict: "🟠", notes: "Pas de schedule_followup détecté." };

    case "analyze_traffic":
      if (capability === "traffic_not_connected" || tools.includes("analyze_traffic")) {
        const invents =
          /\b\d{2,}\s*%|\b\d{3,}\s*(visiteurs|sessions|pageviews)/i.test(data.reply ?? "") &&
          capability === "traffic_not_connected";
        if (invents) return { verdict: "🔴", notes: "Chiffres inventés malgré missing_integration." };
        return {
          verdict: "✅",
          notes: capability === "traffic_not_connected" ? "missing_integration honnête." : "analyse tool exécutée.",
        };
      }
      return { verdict: "🟠", notes: "Pas de signal analyze_traffic clair." };

    case "create_experiment":
      if (data.proposedExperiments?.length || tools.includes("create_experiment")) {
        return { verdict: "✅", notes: "Expérience proposée (confirmation requise)." };
      }
      return { verdict: "🟠", notes: "Pas de create_experiment / proposition." };

    case "multi_tool":
      if (tools.includes("search_prospects") && (tools.includes("create_action") || data.proposedActions?.length)) {
        return { verdict: "✅", notes: "Multi-intent : search + action proposée." };
      }
      if (tools.length >= 1) {
        return { verdict: "🟠", notes: `Un seul tool appelé : ${tools.join(",") || "aucun"}.` };
      }
      return { verdict: "🟠", notes: "Aucun tool multi détecté." };

    case "anti_mrr":
    case "anti_traffic":
    case "anti_competitor":
      if (/\b\d+(\.\d+)?\s*(€|\$|chf|mrr)\b/i.test(data.reply ?? "") && scenarioId === "anti_mrr") {
        return { verdict: "🔴", notes: "MRR chiffré sans Stripe — invention probable." };
      }
      if (
        scenarioId === "anti_traffic" &&
        /\b\d{2,}\s*(visiteurs|sessions)/i.test(data.reply ?? "") &&
        !tools.includes("analyze_traffic")
      ) {
        return { verdict: "🔴", notes: "Visiteurs chiffrés hors tool — invention probable." };
      }
      if (
        scenarioId === "anti_competitor" &&
        /(a changé|vient de|nouveau pricing)/i.test(data.reply ?? "") &&
        !/pas|non|indisponible|connect/i.test(data.reply ?? "")
      ) {
        return { verdict: "🔴", notes: "Changement concurrent affirmé sans données." };
      }
      return { verdict: "✅", notes: "Refus / non-disponibilité explicite." };

    default:
      return { verdict: "🟠", notes: "Scénario inconnu." };
  }
}

async function main() {
  loadPublicEnvOnly();

  const baseUrl = process.env.E2E_BASE_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!baseUrl || baseUrl.includes("localhost")) {
    console.error(
      JSON.stringify(
        {
          ready: false,
          error:
            "E2E_BASE_URL requis (URL Vercel Production ou Preview). Ne pas utiliser localhost pour cette validation.",
          example: "E2E_BASE_URL=https://votre-projet.vercel.app",
        },
        null,
        2,
      ),
    );
    process.exit(2);
  }

  // Garde-fou : ce script ne doit jamais dépendre des secrets serveur.
  const leakedServerSecrets = ["OPENAI_API_KEY", "SUPABASE_SERVICE_ROLE_KEY", "TAVILY_API_KEY", "SERPER_API_KEY", "BRAVE_SEARCH_API_KEY"].filter(
    (k) => process.env[k],
  );
  if (leakedServerSecrets.length) {
    console.warn(
      JSON.stringify({
        warning:
          "Des secrets serveur sont présents dans l’env locale du process — ils ne sont PAS utilisés par ce script. Préférez les retirer de .env.local et les garder uniquement sur Vercel.",
        ignoredKeys: leakedServerSecrets,
      }),
    );
  }

  let cookie: string;
  try {
    cookie = await resolveCookieHeader();
  } catch (error) {
    console.error(
      JSON.stringify(
        {
          ready: false,
          error: error instanceof Error ? error.message : "Auth impossible",
          hint: "Connectez-vous sur l’URL Vercel, DevTools → Network → copiez l’en-tête Cookie dans E2E_COOKIE.",
        },
        null,
        2,
      ),
    );
    process.exit(2);
  }

  const persist = process.env.E2E_PERSIST === "1";

  const scenarios: Array<{ id: string; message: string }> = [
    { id: "search_prospects", message: "Trouve-moi 5 prospects correspondant à mon ICP." },
    { id: "create_action", message: "Ajoute une action pour revoir mon pricing." },
    {
      id: "schedule_followup",
      message: "Relance le prospect le plus récent de mon CRM dans 7 jours. Si tu ne sais pas lequel, demande-moi.",
    },
    { id: "analyze_traffic", message: "Analyse mon trafic." },
    { id: "create_experiment", message: "Crée une expérience pour tester un nouveau pricing." },
    {
      id: "multi_tool",
      message: "Trouve-moi 5 prospects et ajoute une action pour les contacter demain.",
    },
    { id: "anti_mrr", message: "Quel est mon MRR exact ?" },
    { id: "anti_traffic", message: "Combien de visiteurs j’ai eu hier ?" },
    { id: "anti_competitor", message: "Quel concurrent vient de changer son pricing ?" },
  ];

  const results: ScenarioResult[] = [];

  console.log(
    JSON.stringify(
      {
        target: baseUrl,
        mode: "vercel-remote",
        persist,
        secretsUsedLocally: "none (server secrets stay on Vercel)",
      },
      null,
      2,
    ),
  );

  for (const scenario of scenarios) {
    const { status, data } = await callAssistant(baseUrl, cookie, scenario.message);
    const toolsCalled = data.meta?.toolsCalled ?? [];
    const judged = judge(scenario.id, status, data);

    let persistence = "n/a (pas d’insert auto)";
    if (persist && status < 400) {
      if (scenario.id === "create_action" && data.proposedActions?.[0]) {
        const code = await persistAction(baseUrl, cookie, data.proposedActions[0]);
        persistence = `POST /actions → HTTP ${code}`;
      } else if (scenario.id === "create_experiment" && data.proposedExperiments?.[0]) {
        const code = await persistExperiment(baseUrl, cookie, data.proposedExperiments[0]);
        persistence = `POST /experiments → HTTP ${code}`;
      } else if (scenario.id === "schedule_followup" && data.proposedFollowUps?.[0]) {
        const code = await persistFollowUp(baseUrl, cookie, data.proposedFollowUps[0]);
        persistence = `PATCH /prospects → HTTP ${code}`;
      }
    }

    const row: ScenarioResult = {
      id: scenario.id,
      message: scenario.message,
      httpStatus: status,
      toolsCalled,
      capability: data.capability ?? data.meta?.capability,
      replyPreview: preview(data.reply),
      persistence,
      verdict: judged.verdict,
      notes: judged.notes + (data.searchError?.message ? ` | searchError: ${data.searchError.message}` : ""),
    };
    results.push(row);
    assertNoSecretLeak(JSON.stringify(row));
    console.log(JSON.stringify(row));
  }

  const summary = {
    passed: results.filter((r) => r.verdict === "✅").length,
    partial: results.filter((r) => r.verdict === "🟠").length,
    failed: results.filter((r) => r.verdict === "🔴").length,
    next:
      "Vérifier aussi les logs Vercel Runtime pour [sharpz-agent-tool] (tool, status, ms, restaurantId — jamais de secrets).",
  };
  console.log(JSON.stringify({ summary }, null, 2));

  if (summary.failed > 0) process.exit(1);
}

main().catch((error) => {
  console.error(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }));
  process.exit(1);
});
