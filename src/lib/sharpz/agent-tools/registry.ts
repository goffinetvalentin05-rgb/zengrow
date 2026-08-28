import type { ChatCompletionTool } from "openai/resources/chat/completions";
import type { AgentToolName, SharpzAgentContext } from "@/src/lib/sharpz/agent-tools/types";

export type AgentToolDefinition = {
  name: AgentToolName;
  description: string;
  openaiTool: ChatCompletionTool;
  /** Si false, le tool n'est pas exposé au modèle */
  isAvailable: (context: SharpzAgentContext) => boolean;
  requiresConfirmation: boolean;
};

const SEARCH_PROSPECTS: AgentToolDefinition = {
  name: "search_prospects",
  description:
    "Recherche web de prospects réels alignés ICP. Retourne des entreprises vérifiables — jamais inventées. Nécessite une clé API search configurée.",
  requiresConfirmation: false,
  // Toujours exposé : le handler renvoie not_configured si aucune clé provider.
  isAvailable: () => true,
  openaiTool: {
    type: "function",
    function: {
      name: "search_prospects",
      description:
        "Recherche de prospects réels via le web. Utilise quand l'utilisateur demande de trouver/chercher des prospects, leads ou entreprises cibles. Si non configuré, le serveur renvoie not_configured — ne jamais inventer de prospects.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Critères de recherche (ICP, secteur, zone, type d'entreprise)" },
          count: { type: "integer", minimum: 1, maximum: 10, description: "Nombre de prospects (défaut 5)" },
        },
        required: ["query"],
        additionalProperties: false,
      },
    },
  },
};

const CREATE_ACTION: AgentToolDefinition = {
  name: "create_action",
  description: "Propose une action concrète pour le Dashboard (Aujourd'hui). Persistance après validation utilisateur.",
  requiresConfirmation: true,
  isAvailable: () => true,
  openaiTool: {
    type: "function",
    function: {
      name: "create_action",
      description:
        "Propose une action growth concrète à ajouter au plan du jour. Utilise quand l'utilisateur veut ajouter/créer une action ou tâche prioritaire.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Titre court de l'action" },
          category: {
            type: "string",
            enum: [
              "acquisition",
              "conversion",
              "landing",
              "pricing",
              "content",
              "seo",
              "retention",
              "market",
              "prospection",
              "monetisation",
              "positioning",
            ],
          },
          impact: { type: "integer", minimum: 1, maximum: 10 },
          effort: { type: "integer", minimum: 1, maximum: 10 },
          confidence: { type: "integer", minimum: 0, maximum: 100 },
          why: { type: "string", description: "Pourquoi cette action maintenant" },
          howTo: { type: "string", description: "Comment exécuter" },
          objectiveKey: { type: "string", nullable: true },
        },
        required: ["title"],
        additionalProperties: false,
      },
    },
  },
};

const SCHEDULE_FOLLOWUP: AgentToolDefinition = {
  name: "schedule_followup",
  description: "Programme une relance prospect réelle (next_follow_up_at). Persistance après validation utilisateur.",
  requiresConfirmation: true,
  isAvailable: () => true,
  openaiTool: {
    type: "function",
    function: {
      name: "schedule_followup",
      description:
        "Programme une relance pour un prospect existant du CRM. Utilise quand l'utilisateur demande de relancer un prospect dans X jours.",
      parameters: {
        type: "object",
        properties: {
          prospectId: { type: "string", description: "UUID du prospect (préféré si connu dans le contexte)" },
          company: { type: "string", description: "Nom entreprise si prospectId inconnu" },
          daysFromNow: { type: "integer", minimum: 1, maximum: 90, description: "Délai en jours (défaut 7)" },
          note: { type: "string", description: "Note optionnelle pour la relance" },
        },
        additionalProperties: false,
      },
    },
  },
};

const ANALYZE_TRAFFIC: AgentToolDefinition = {
  name: "analyze_traffic",
  description: "Analyse le trafic Sharpz Analytics réel. Retourne missing_integration si aucune donnée.",
  requiresConfirmation: false,
  isAvailable: () => true,
  openaiTool: {
    type: "function",
    function: {
      name: "analyze_traffic",
      description:
        "Analyse les données de trafic réelles (visiteurs, pages, sources). Utilise quand l'utilisateur demande d'analyser son trafic, visiteurs ou acquisition web.",
      parameters: {
        type: "object",
        properties: {
          periodDays: { type: "integer", minimum: 1, maximum: 90, description: "Période en jours (défaut 7)" },
        },
        additionalProperties: false,
      },
    },
  },
};

const CREATE_EXPERIMENT: AgentToolDefinition = {
  name: "create_experiment",
  description: "Propose une expérimentation A/B. Persistance après validation utilisateur.",
  requiresConfirmation: true,
  isAvailable: () => true,
  openaiTool: {
    type: "function",
    function: {
      name: "create_experiment",
      description:
        "Propose une expérimentation pour tester une hypothèse (pricing, landing, etc.). Utilise quand l'utilisateur veut créer/lancer un test.",
      parameters: {
        type: "object",
        properties: {
          hypothesis: { type: "string", description: "Hypothèse testable" },
          title: { type: "string", description: "Titre court de l'expérience" },
          actionId: { type: "string", nullable: true, description: "Action liée (UUID optionnel)" },
          actionDescription: { type: "string", nullable: true, description: "Description action si pas d'actionId" },
          metric: {
            type: "string",
            enum: [
              "visitors_7d",
              "pageviews_7d",
              "sessions_7d",
              "prospects_customers",
              "prospects_qualified",
              "mrr",
            ],
            description: "Métrique réelle mesurable uniquement",
          },
          plannedDays: { type: "integer", minimum: 1, maximum: 90 },
        },
        required: ["hypothesis"],
        additionalProperties: false,
      },
    },
  },
};

const SEARCH_COMPETITORS: AgentToolDefinition = {
  name: "search_competitors",
  description:
    "Recherche web réelle de concurrents (Tavily/Serper/Brave). Retourne des propositions à valider — jamais d'insert auto, jamais de noms inventés.",
  requiresConfirmation: false,
  isAvailable: () => true,
  openaiTool: {
    type: "function",
    function: {
      name: "search_competitors",
      description:
        "Recherche de concurrents sur le web à partir du SaaS / ICP / marché. Résultats à faire valider par l'utilisateur avant ajout.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string" },
          count: { type: "integer", minimum: 1, maximum: 10 },
        },
        additionalProperties: false,
      },
    },
  },
};

const ANALYZE_COMPETITOR_CHANGES: AgentToolDefinition = {
  name: "analyze_competitor_changes",
  description:
    "Lit les changements concurrents réellement persistés (competitor_changes). Aucune invention.",
  requiresConfirmation: false,
  isAvailable: () => true,
  openaiTool: {
    type: "function",
    function: {
      name: "analyze_competitor_changes",
      description:
        "Liste les changements détectés sur les concurrents suivis (pricing, hero, etc.). Utilise si l'utilisateur demande ce qui a changé chez un concurrent.",
      parameters: {
        type: "object",
        properties: {
          days: { type: "integer", minimum: 1, maximum: 90 },
          competitorName: { type: "string" },
        },
        additionalProperties: false,
      },
    },
  },
};

const CREATE_COMPETITOR: AgentToolDefinition = {
  name: "create_competitor",
  description: "Propose l'ajout d'un concurrent (URL publique). Persistance après validation utilisateur.",
  requiresConfirmation: true,
  isAvailable: () => true,
  openaiTool: {
    type: "function",
    function: {
      name: "create_competitor",
      description:
        "Propose d'ajouter un concurrent connu avec URL publique. Validation utilisateur obligatoire — pas d'insert automatique.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          url: { type: "string" },
          whyCompetitor: { type: "string", nullable: true },
          sourceUrl: { type: "string", nullable: true },
        },
        required: ["name", "url"],
        additionalProperties: false,
      },
    },
  },
};

const CREATE_PROSPECT: AgentToolDefinition = {
  name: "create_prospect",
  description: "Propose l'ajout manuel d'un prospect au CRM. Persistance après validation utilisateur.",
  requiresConfirmation: true,
  isAvailable: () => true,
  openaiTool: {
    type: "function",
    function: {
      name: "create_prospect",
      description:
        "Propose d'ajouter un prospect connu (entreprise/contact) au CRM. Ne jamais inventer email/téléphone. Validation utilisateur obligatoire.",
      parameters: {
        type: "object",
        properties: {
          company: { type: "string" },
          name: { type: "string", nullable: true },
          url: { type: "string", nullable: true },
          email: { type: "string", nullable: true },
          phone: { type: "string", nullable: true },
          contact: { type: "string", nullable: true },
          whyFit: { type: "string", nullable: true },
          notes: { type: "string", nullable: true },
        },
        required: ["company"],
        additionalProperties: false,
      },
    },
  },
};

export const AGENT_TOOLS: AgentToolDefinition[] = [
  SEARCH_PROSPECTS,
  CREATE_ACTION,
  SCHEDULE_FOLLOWUP,
  ANALYZE_TRAFFIC,
  CREATE_EXPERIMENT,
  SEARCH_COMPETITORS,
  ANALYZE_COMPETITOR_CHANGES,
  CREATE_COMPETITOR,
  CREATE_PROSPECT,
];

export function getAvailableTools(context: SharpzAgentContext): AgentToolDefinition[] {
  return AGENT_TOOLS.filter((tool) => tool.isAvailable(context));
}

export function getToolByName(name: string): AgentToolDefinition | undefined {
  return AGENT_TOOLS.find((tool) => tool.name === name);
}
