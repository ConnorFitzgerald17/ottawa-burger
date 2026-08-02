import { describe, expect, it } from "vitest";
import { slugify } from "./utils";

describe("restaurant slugs", () => {
  it.each([
    ["Chez Lucien", "chez-lucien"],
    ["Patty's Pub", "pattys-pub"],
    ["Burgers n’ Fries Forever", "burgers-n-fries-forever"],
    ["La Belle & La Bœuf", "la-belle-la-boeuf"],
  ])("turns %s into %s", (name, slug) => {
    expect(slugify(name)).toBe(slug);
  });
});
