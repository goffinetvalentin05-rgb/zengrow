import { describe, expect, it } from "vitest";
import {
  buildReservationRowMetadata,
  formatGuestPhoneDisplay,
  isArrivalWindowOpen,
} from "@/src/components/dashboard/reservations/utils/reservation-list-metadata";
import type { ReservationRow } from "@/src/components/dashboard/reservations/types";

const baseRow: ReservationRow = {
  id: "1",
  reservation_date: "2026-05-16",
  reservation_time: "12:00",
  guest_name: "Valentin Goffinet",
  guest_phone: "0782545684",
  guest_email: null,
  guests: 2,
  status: "confirmed",
  internal_note: "Allergie aux noix",
  created_at: "2026-01-01T00:00:00Z",
};

describe("formatGuestPhoneDisplay", () => {
  it("formate un numéro suisse 10 chiffres", () => {
    expect(formatGuestPhoneDisplay("0782545684")).toBe("078 254 56 84");
  });
});

describe("buildReservationRowMetadata", () => {
  it("priorise zone + téléphone", () => {
    expect(buildReservationRowMetadata(baseRow, "interior", "Terrasse")).toBe(
      "Salle · 078 254 56 84",
    );
  });

  it("affiche la note si pas de téléphone", () => {
    expect(
      buildReservationRowMetadata(
        { ...baseRow, guest_phone: null },
        "terrace",
        "Terrasse",
      ),
    ).toBe("Terrasse · Allergie aux noix");
  });
});

describe("isArrivalWindowOpen", () => {
  it("est faux pour une résa en attente", () => {
    expect(
      isArrivalWindowOpen(
        { ...baseRow, status: "pending" },
        new Date("2026-05-16T11:50:00+02:00"),
      ),
    ).toBe(false);
  });
});
