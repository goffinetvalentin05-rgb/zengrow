import { z } from "zod";

export const UI_LANGUAGES = [
  { value: "fr", label: "Français" },
  { value: "en", label: "English" },
] as const;

export const ENGLISH_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export const LEARNING_GOALS = [
  { value: "everyday", label: "Everyday English" },
  { value: "work", label: "Work" },
  { value: "travel", label: "Travel" },
  { value: "studies", label: "Studies" },
  { value: "content", label: "Films, series and content" },
] as const;

export const WEEKLY_MINUTES = [30, 60, 90, 150, 300] as const;

export const LEARNING_ACTIVITIES = [
  { value: "conversation", label: "ChatGPT conversation" },
  { value: "podcast", label: "Podcasts" },
  { value: "reading", label: "Reading" },
  { value: "video", label: "Videos / series" },
  { value: "review", label: "Review" },
] as const;

export const onboardingInputSchema = z.object({
  uiLanguage: z.enum(["fr", "en"]),
  level: z.enum(ENGLISH_LEVELS),
  primaryGoal: z.enum(["everyday", "work", "travel", "studies", "content"]),
  weeklyMinutes: z.union([
    z.literal(30),
    z.literal(60),
    z.literal(90),
    z.literal(150),
    z.literal(300),
  ]),
  preferredActivities: z.array(z.enum(["conversation", "podcast", "reading", "video", "review"])).min(1).max(5),
  timezone: z.string().trim().min(1).max(80).optional(),
});

export type OnboardingInput = z.infer<typeof onboardingInputSchema>;
