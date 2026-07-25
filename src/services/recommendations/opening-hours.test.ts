import { describe, expect, it } from "vitest";
import { isOpenAt } from "@/services/recommendations/opening-hours";

const monday = new Date("2026-07-27T10:00:00+07:00");
const mondayBreak = new Date("2026-07-27T15:00:00+07:00");
const mondayNight = new Date("2026-07-27T23:30:00+07:00");

describe("isOpenAt", () => {
  it("returns true inside normal opening window", () => {
    expect(
      isOpenAt([{ dayOfWeek: 1, openTime: "07:00", closeTime: "22:00", isClosed: false }], monday)
    ).toBe(true);
  });

  it("returns false during mid-day break", () => {
    expect(
      isOpenAt(
        [
          {
            dayOfWeek: 1,
            openTime: "07:00",
            closeTime: "22:00",
            breakStart: "14:00",
            breakEnd: "16:00",
            isClosed: false
          }
        ],
        mondayBreak
      )
    ).toBe(false);
  });

  it("supports restaurants open past midnight", () => {
    expect(
      isOpenAt([{ dayOfWeek: 1, openTime: "18:00", closeTime: "02:00", isClosed: false }], mondayNight)
    ).toBe(true);
  });
});

