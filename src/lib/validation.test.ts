import { describe, expect, it } from "vitest";
import { ratingSchema, whiskeySourDetailsSchema } from "./validation";

const baseRating = {
  reviewerId: "00000000-0000-0000-0000-000000000001",
  category: "burger" as const,
};

describe("rating precision", () => {
  it.each([0, 7.1, 8.6, 9.9, 10])("accepts the one-decimal score %s", (score) => {
    expect(ratingSchema.safeParse({ ...baseRating, score }).success).toBe(true);
  });

  it.each([-0.1, 7.11, 10.1])("rejects the invalid score %s", (score) => {
    expect(ratingSchema.safeParse({ ...baseRating, score }).success).toBe(false);
  });
});

describe("whiskey sour details", () => {
  it("allows the optional section to be omitted", () => {
    expect(whiskeySourDetailsSchema.safeParse({}).success).toBe(true);
  });

  it("accepts a complete score and tasting note", () => {
    expect(whiskeySourDetailsSchema.safeParse({
      whiskeySourScore: 8.6,
      whiskeySourNotes: "Bright lemon, a proper foam cap, and a balanced finish.",
    }).success).toBe(true);
  });

  it.each([
    { whiskeySourScore: 8.6 },
    { whiskeySourNotes: "Balanced and properly tart." },
  ])("rejects partial details: %o", (details) => {
    expect(whiskeySourDetailsSchema.safeParse(details).success).toBe(false);
  });

  it.each([-0.1, 7.11, 10.1])("rejects the invalid sour score %s", (score) => {
    expect(whiskeySourDetailsSchema.safeParse({
      whiskeySourScore: score,
      whiskeySourNotes: "Balanced and properly tart.",
    }).success).toBe(false);
  });
});
