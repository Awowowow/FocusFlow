import { describe, expect, it } from "vitest";
import { dayBounds, lastSevenDayRanges, overlapSeconds } from "./dates.js";

describe("summary date calculations", () => {
  it("uses the user's timezone to bound a calendar day", () => {
    const bounds = dayBounds("Asia/Kolkata", new Date("2026-05-26T12:00:00.000Z"));
    expect(bounds.start.toISOString()).toBe("2026-05-25T18:30:00.000Z");
    expect(bounds.end.toISOString()).toBe("2026-05-26T18:30:00.000Z");
  });

  it("only counts the segment of a session inside today's range", () => {
    const start = new Date("2026-05-25T18:30:00.000Z");
    const end = new Date("2026-05-26T18:30:00.000Z");
    const log = { startedAt: new Date("2026-05-25T18:00:00.000Z"), endedAt: new Date("2026-05-25T19:00:00.000Z") };
    expect(overlapSeconds(log, start, end)).toBe(1800);
  });

  it("creates seven ordered reporting buckets", () => {
    const ranges = lastSevenDayRanges("Asia/Kolkata", new Date("2026-05-26T12:00:00.000Z"));
    expect(ranges).toHaveLength(7);
    expect(ranges[6].date).toBe("2026-05-26");
  });
});

