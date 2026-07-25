import { describe, expect, it } from "vitest";
import { estimateStopCostPerPerson, fitsRemainingBudget } from "@/services/recommendations/budget";

describe("budget helpers", () => {
  it("estimates stop cost from min and max price", () => {
    expect(estimateStopCostPerPerson(40_000, 80_000)).toBe(60_000);
  });

  it("rejects stops that exceed total group budget", () => {
    expect(
      fitsRemainingBudget({
        currentTotalCost: 150_000,
        stopCostPerPerson: 80_000,
        numberOfPeople: 2,
        totalBudget: 250_000
      })
    ).toBe(false);
  });
});

