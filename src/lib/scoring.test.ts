import { describe, expect, it } from "vitest";
import { calculateCategoryAverage, calculateOverallScore, calculateReviewerScore } from "./scoring";
import type { Rating } from "./types";

describe("burger-first scoring", () => {
  it("weights burger at 40 percent and divides the rest evenly", () => {
    expect(
      calculateReviewerScore([
        { category: "burger", score: 9 },
        { category: "fries", score: 7 },
        { category: "beer", score: 8 },
        { category: "beer_selection", score: 6 },
        { category: "service", score: 8 },
        { category: "atmosphere", score: 6 },
      ]),
    ).toBe(7.8);
  });

  it("redistributes the non-burger weight when beer is not applicable", () => {
    expect(
      calculateReviewerScore([
        { category: "burger", score: 8 },
        { category: "fries", score: 7 },
        { category: "service", score: 9 },
        { category: "atmosphere", score: 8 },
      ]),
    ).toBe(8);
  });

  it("requires a burger score", () => {
    expect(calculateReviewerScore([{ category: "fries", score: 10 }])).toBeNull();
  });

  it("averages the reviewer results", () => {
    const ratings: Rating[] = [
      { reviewerId: "connor", category: "burger", score: 9 },
      { reviewerId: "connor", category: "fries", score: 8 },
      { reviewerId: "alex", category: "burger", score: 7 },
      { reviewerId: "alex", category: "fries", score: 6 },
    ];
    expect(calculateOverallScore(ratings)).toBe(7.4);
  });

  it("calculates category averages", () => {
    const ratings: Rating[] = [
      { reviewerId: "connor", category: "burger", score: 8.5 },
      { reviewerId: "alex", category: "burger", score: 7.5 },
    ];
    expect(calculateCategoryAverage(ratings, "burger")).toBe(8);
    expect(calculateCategoryAverage(ratings, "beer")).toBeNull();
  });
});
