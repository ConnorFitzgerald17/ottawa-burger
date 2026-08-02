import { describe, expect, it } from "vitest";
import { ratingSchema } from "./validation";

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
