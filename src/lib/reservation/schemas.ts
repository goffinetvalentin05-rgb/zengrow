import { z } from "zod";

const optionalEmail = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.string().email("E-mail invalide.").optional(),
);

const optionalPhone = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.string().trim().max(40).optional(),
);

export const publicReservationPostSchema = z.object({
  restaurantId: z.string().uuid(),
  guestName: z.string().trim().min(1, "Le nom est requis.").max(200),
  guestEmail: optionalEmail,
  guestPhone: optionalPhone,
  guests: z.coerce.number().int().min(1).max(500),
  reservationDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide.")
    .refine((d) => !Number.isNaN(Date.parse(d)), "Date invalide."),
  reservationTime: z.string().regex(/^\d{2}:\d{2}$/, "Heure invalide."),
});

export type PublicReservationPostInput = z.infer<typeof publicReservationPostSchema>;

export const availabilityQuerySchema = z.object({
  restaurantId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  covers: z.coerce.number().int().min(1).max(500),
});

export type AvailabilitySlot = {
  time: string;
  suggestedTableId: string | null;
  remainingCapacity: number | null;
};
