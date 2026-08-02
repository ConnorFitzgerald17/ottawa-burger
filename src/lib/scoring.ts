import type { Rating, RatingCategory } from "@/lib/types";

const roundToOne = (value: number) => Math.round((value + Number.EPSILON) * 10) / 10;

export function calculateReviewerScore(
  ratings: Pick<Rating, "category" | "score">[],
): number | null {
  const burger = ratings.find((rating) => rating.category === "burger");
  if (!burger) return null;

  const otherScores = ratings
    .filter((rating) => rating.category !== "burger")
    .map((rating) => rating.score);

  if (otherScores.length === 0) return roundToOne(burger.score);

  const otherAverage =
    otherScores.reduce((total, score) => total + score, 0) / otherScores.length;

  return roundToOne(burger.score * 0.4 + otherAverage * 0.6);
}

export function calculateOverallScore(ratings: Rating[]): number | null {
  const byReviewer = new Map<string, Rating[]>();

  for (const rating of ratings) {
    const list = byReviewer.get(rating.reviewerId) ?? [];
    list.push(rating);
    byReviewer.set(rating.reviewerId, list);
  }

  const reviewerScores = [...byReviewer.values()]
    .map(calculateReviewerScore)
    .filter((score): score is number => score !== null);

  if (reviewerScores.length === 0) return null;

  return roundToOne(
    reviewerScores.reduce((total, score) => total + score, 0) /
      reviewerScores.length,
  );
}

export function calculateCategoryAverage(
  ratings: Rating[],
  category: RatingCategory,
): number | null {
  const scores = ratings
    .filter((rating) => rating.category === category)
    .map((rating) => rating.score);

  if (scores.length === 0) return null;
  return roundToOne(scores.reduce((total, score) => total + score, 0) / scores.length);
}
