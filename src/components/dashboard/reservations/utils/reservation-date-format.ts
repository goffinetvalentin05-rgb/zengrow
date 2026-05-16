import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { fr } from "date-fns/locale";
import { formatInTimeZone, toDate, toZonedTime } from "date-fns-tz";
import { businessCalendarTimeZone } from "@/src/lib/date/business-calendar";
import { addCalendarDaysYmd } from "@/src/components/dashboard/reservations/utils/reservation-filters";

export type CalendarDayCell = {
  ymd: string;
  dayNum: number;
  inMonth: boolean;
};

export function formatYmdLongFr(ymd: string): string {
  const tz = businessCalendarTimeZone();
  const raw = formatInTimeZone(toDate(`${ymd}T12:00:00`, { timeZone: tz }), tz, "EEEE d MMMM yyyy", {
    locale: fr,
  });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function formatYmdMonthYearFr(ymd: string): string {
  const tz = businessCalendarTimeZone();
  const raw = formatInTimeZone(toDate(`${ymd}T12:00:00`, { timeZone: tz }), tz, "MMMM yyyy", {
    locale: fr,
  });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function ymdFromZonedDate(date: Date): string {
  return formatInTimeZone(date, businessCalendarTimeZone(), "yyyy-MM-dd");
}

export function monthGridWeeks(anchorYmd: string): CalendarDayCell[][] {
  const tz = businessCalendarTimeZone();
  const anchor = toZonedTime(toDate(`${anchorYmd}T12:00:00`, { timeZone: tz }), tz);
  const monthStart = startOfMonth(anchor);
  const monthEnd = endOfMonth(anchor);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const cells: CalendarDayCell[] = days.map((d) => ({
    ymd: ymdFromZonedDate(d),
    dayNum: Number.parseInt(format(d, "d"), 10),
    inMonth: isSameMonth(d, anchor),
  }));

  const weeks: CalendarDayCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

export function shiftYmdMonth(ymd: string, deltaMonths: number): string {
  const tz = businessCalendarTimeZone();
  const d = toZonedTime(toDate(`${ymd}T12:00:00`, { timeZone: tz }), tz);
  const shifted = new Date(d);
  shifted.setMonth(shifted.getMonth() + deltaMonths);
  return formatInTimeZone(shifted, tz, "yyyy-MM-dd");
}

export { addCalendarDaysYmd };
