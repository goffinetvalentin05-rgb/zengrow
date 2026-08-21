type StyleAILogEvent = {
  provider: "openai" | "mock" | string;
  type: "vision" | "image" | "json_repair";
  durationMs: number;
  ok: boolean;
  code?: string;
};

export function logStyleAICall(event: StyleAILogEvent) {
  console.info("[fitme-ai]", {
    provider: event.provider,
    type: event.type,
    durationMs: Math.round(event.durationMs),
    ok: event.ok,
    code: event.code ?? null,
  });
}
