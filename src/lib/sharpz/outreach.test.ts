import { describe, expect, it } from "vitest";
import {
  availableOutreachChannels,
  interpolateScript,
  pipelineStatusToScriptStage,
  phoneDigits,
  whatsappHref,
} from "./outreach";

describe("interpolateScript", () => {
  it("replaces known variables only", () => {
    const text = interpolateScript("Bonjour {{first_name}} chez {{company}} — {{offer}}", {
      first_name: "Léa",
      company: "Nova",
    });
    expect(text).toBe("Bonjour Léa chez Nova — {{offer}}");
  });

  it("does not invent empty values", () => {
    expect(interpolateScript("Hi {{first_name}}", { first_name: "  " })).toBe("Hi {{first_name}}");
  });
});

describe("whatsappHref", () => {
  it("builds a wa.me deep link with encoded text", () => {
    expect(whatsappHref("+33 6 12 34 56 78", "Bonjour Léa")).toBe(
      "https://wa.me/33612345678?text=Bonjour%20L%C3%A9a",
    );
  });

  it("requires a usable number", () => {
    expect(whatsappHref("12")).toBeNull();
    expect(phoneDigits("00 33 6 12 34 56 78")).toBe("33612345678");
  });
});

describe("availableOutreachChannels", () => {
  it("shows WhatsApp and call when a phone exists", () => {
    expect(availableOutreachChannels({ phone: "+33612345678" })).toEqual(["whatsapp", "phone"]);
  });

  it("shows LinkedIn only with a profile URL", () => {
    expect(availableOutreachChannels({ linkedinUrl: "linkedin.com/in/lea" })).toEqual(["linkedin"]);
  });
});

describe("pipelineStatusToScriptStage", () => {
  it("maps pipeline statuses to script stages", () => {
    expect(pipelineStatusToScriptStage("to_contact")).toBe("first_contact");
    expect(pipelineStatusToScriptStage("follow_up_1")).toBe("follow_up_1");
    expect(pipelineStatusToScriptStage("qualified")).toBe("closing");
  });
});
