import { addDays, startOfDay, subDays } from "date-fns";
import { format, fromZonedTime, toZonedTime } from "date-fns-tz";

export const dayBounds = (timeZone, now = new Date()) => {
  const zonedNow = toZonedTime(now, timeZone);
  const startLocal = startOfDay(zonedNow);
  return {
    start: fromZonedTime(startLocal, timeZone),
    end: fromZonedTime(addDays(startLocal, 1), timeZone),
  };
};

export const lastSevenDayRanges = (timeZone, now = new Date()) => {
  const zonedNow = toZonedTime(now, timeZone);
  const today = startOfDay(zonedNow);
  return Array.from({ length: 7 }, (_, index) => {
    const localStart = subDays(today, 6 - index);
    return {
      label: format(localStart, "EEE", { timeZone }),
      date: format(localStart, "yyyy-MM-dd", { timeZone }),
      start: fromZonedTime(localStart, timeZone),
      end: fromZonedTime(addDays(localStart, 1), timeZone),
    };
  });
};

export const overlapSeconds = (log, start, end, now = new Date()) => {
  const logStart = new Date(log.startedAt).getTime();
  const logEnd = new Date(log.endedAt ?? now).getTime();
  const clippedStart = Math.max(logStart, start.getTime());
  const clippedEnd = Math.min(logEnd, end.getTime());
  return Math.max(0, Math.floor((clippedEnd - clippedStart) / 1000));
};
