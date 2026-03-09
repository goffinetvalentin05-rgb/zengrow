export type OpeningHoursRange = {
  start: string;
  end: string;
};

export type OpeningHours = Record<string, OpeningHoursRange[]>;

const dayMap = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
export const dayLabels: Record<string, string> = {
  mon: "Lundi",
  tue: "Mardi",
  wed: "Mercredi",
  thu: "Jeudi",
  fri: "Vendredi",
  sat: "Samedi",
  sun: "Dimanche",
};
export const dayOrder = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

export function slugifyRestaurantName(name: string) {
  return name
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function getWeekdayKey(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);
  return dayMap[date.getDay()];
}

export function getDefaultOpeningHours(): OpeningHours {
  return {
    mon: [
      { start: "11:30", end: "14:30" },
      { start: "18:00", end: "22:00" },
    ],
    tue: [
      { start: "11:30", end: "14:30" },
      { start: "18:00", end: "22:00" },
    ],
    wed: [
      { start: "11:30", end: "14:30" },
      { start: "18:00", end: "22:00" },
    ],
    thu: [
      { start: "11:30", end: "14:30" },
      { start: "18:00", end: "22:00" },
    ],
    fri: [
      { start: "11:30", end: "14:30" },
      { start: "18:00", end: "22:30" },
    ],
    sat: [
      { start: "11:30", end: "15:00" },
      { start: "18:00", end: "22:30" },
    ],
    sun: [],
  };
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(value: number) {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function generateTimeSlotsForDate(
  dateString: string,
  openingHours: OpeningHours | null | undefined,
  slotInterval: number,
) {
  const safeOpeningHours = openingHours ?? getDefaultOpeningHours();
  const weekday = getWeekdayKey(dateString);
  const ranges = safeOpeningHours[weekday] ?? [];
  const slots: string[] = [];

  for (const range of ranges) {
    let current = timeToMinutes(range.start);
    const end = timeToMinutes(range.end);

    while (current <= end - slotInterval) {
      slots.push(minutesToTime(current));
      current += slotInterval;
    }
  }

  return slots;
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
