import { describe, expect, it } from "vitest";
import { buildPublicWizardSteps } from "@/src/lib/reservation/public-wizard-steps";
import {
  normalizeReservationMode,
  timeHhMmFromDb,
} from "@/src/lib/reservation/reservation-modes";
import { mapReservationRpcError } from "@/src/lib/reservation/map-reservation-error";
import {
  clampCoversCapacity,
  clampMealDurationMinutes,
  clampPartySize,
  clampSlotInterval,
  clampTimeSlotsGroups,
  effectiveMaxPartySizeForPublic,
  isReservationCapacityConfigured,
  validateReservationSettingsInput,
} from "@/src/lib/reservation/reservation-settings";

describe("normalizeReservationMode", () => {
  it("defaults unknown values to global_covers", () => {
    expect(normalizeReservationMode(null)).toBe("global_covers");
    expect(normalizeReservationMode("simple")).toBe("global_covers");
    expect(normalizeReservationMode(undefined)).toBe("global_covers");
  });

  it("keeps time_slots", () => {
    expect(normalizeReservationMode("time_slots")).toBe("time_slots");
  });
});

describe("buildPublicWizardSteps", () => {
  it("puts guests first in time_slots mode", () => {
    expect(buildPublicWizardSteps("time_slots", false)).toEqual([
      "guests",
      "date",
      "time",
      "contact",
    ]);
  });

  it("puts date first in global_covers mode", () => {
    expect(buildPublicWizardSteps("global_covers", false)).toEqual([
      "date",
      "guests",
      "time",
      "contact",
    ]);
  });

  it("inserts zone step when terrace choice is enabled", () => {
    expect(buildPublicWizardSteps("global_covers", true)).toEqual([
      "date",
      "guests",
      "time",
      "zone",
      "contact",
    ]);
    expect(buildPublicWizardSteps("time_slots", true)).toEqual([
      "guests",
      "date",
      "time",
      "zone",
      "contact",
    ]);
  });
});

describe("clamp helpers", () => {
  it("clamps covers, durations, party size, groups, slot interval", () => {
    expect(clampCoversCapacity(0)).toBe(1);
    expect(clampCoversCapacity(999)).toBe(500);
    expect(clampMealDurationMinutes(10)).toBe(30);
    expect(clampMealDurationMinutes(300)).toBe(240);
    expect(clampPartySize(1)).toBe(2);
    expect(clampPartySize(50)).toBe(30);
    expect(clampTimeSlotsGroups(0)).toBe(1);
    expect(clampSlotInterval(45)).toBe(30);
    expect(clampSlotInterval(15)).toBe(15);
  });
});

describe("effectiveMaxPartySizeForPublic", () => {
  it("uses time_slots_max_party_size in time_slots mode", () => {
    expect(
      effectiveMaxPartySizeForPublic({
        reservation_mode: "time_slots",
        max_party_size: 12,
        time_slots_max_party_size: 6,
      }),
    ).toBe(6);
  });

  it("uses max_party_size in global_covers mode", () => {
    expect(
      effectiveMaxPartySizeForPublic({
        reservation_mode: "global_covers",
        max_party_size: 10,
        time_slots_max_party_size: 6,
      }),
    ).toBe(10);
  });
});

describe("isReservationCapacityConfigured", () => {
  it("requires at least one service", () => {
    expect(
      isReservationCapacityConfigured({
        reservation_mode: "global_covers",
        service_lunch_enabled: false,
        service_dinner_enabled: false,
        service_lunch_max_covers: 40,
        service_dinner_max_covers: 50,
      }),
    ).toBe(false);
  });

  it("checks cover caps in global_covers mode", () => {
    expect(
      isReservationCapacityConfigured({
        reservation_mode: "global_covers",
        service_lunch_max_covers: 0,
        service_dinner_max_covers: 50,
      }),
    ).toBe(false);
    expect(
      isReservationCapacityConfigured({
        reservation_mode: "global_covers",
        service_lunch_max_covers: 30,
        service_dinner_max_covers: 40,
      }),
    ).toBe(true);
  });

  it("checks group caps in time_slots mode", () => {
    expect(
      isReservationCapacityConfigured({
        reservation_mode: "time_slots",
        time_slots_lunch_max_groups: 0,
        time_slots_dinner_max_groups: 8,
      }),
    ).toBe(false);
    expect(
      isReservationCapacityConfigured({
        reservation_mode: "time_slots",
        time_slots_lunch_max_groups: 5,
        time_slots_dinner_max_groups: 8,
      }),
    ).toBe(true);
  });
});

describe("validateReservationSettingsInput", () => {
  const base = {
    lunchServiceEnabled: true,
    dinnerServiceEnabled: true,
    lunchMaxCovers: 40,
    dinnerMaxCovers: 50,
    lunchDurationMinutes: 90,
    dinnerDurationMinutes: 120,
    maxPartySize: 8,
    timeSlotsLunchMaxGroups: 5,
    timeSlotsDinnerMaxGroups: 8,
    timeSlotsMaxPartySize: 8,
  };

  it("validates global_covers inputs", () => {
    expect(validateReservationSettingsInput({ ...base, mode: "global_covers" })).toEqual({ ok: true });
    expect(
      validateReservationSettingsInput({ ...base, mode: "global_covers", lunchDurationMinutes: 20 }),
    ).toMatchObject({ ok: false });
  });

  it("validates time_slots inputs", () => {
    expect(validateReservationSettingsInput({ ...base, mode: "time_slots" })).toEqual({ ok: true });
    expect(
      validateReservationSettingsInput({ ...base, mode: "time_slots", timeSlotsLunchMaxGroups: 0 }),
    ).toMatchObject({ ok: false });
  });
});

describe("mapReservationRpcError", () => {
  it("maps MAX_PARTY with configured limit", () => {
    expect(mapReservationRpcError({ message: "MAX_PARTY" } as never, "x", 6)).toContain("6");
  });
});

describe("timeHhMmFromDb", () => {
  it("normalizes HH:MM:SS from database", () => {
    expect(timeHhMmFromDb("11:30:00", "12:00")).toBe("11:30");
    expect(timeHhMmFromDb(null, "12:00")).toBe("12:00");
  });
});
