export const ratingCategories = [
  "burger",
  "fries",
  "beer",
  "beer_selection",
  "service",
  "atmosphere",
] as const;

export type RatingCategory = (typeof ratingCategories)[number];
export type ReviewStatus = "draft" | "published" | "archived";
export type BaselineType = "original" | "closest" | "exception";

export const categoryLabels: Record<RatingCategory, string> = {
  burger: "Burger",
  fries: "Fries",
  beer: "Beer",
  beer_selection: "Beer selection",
  service: "Service",
  atmosphere: "Atmosphere",
};

export interface Reviewer {
  id: string;
  slug: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
}

export interface Venue {
  id: string;
  name: string;
  slug: string;
  address: string;
  neighbourhood: string;
  websiteUrl: string | null;
  phone: string | null;
}

export interface Rating {
  reviewerId: string;
  category: RatingCategory;
  score: number;
}

export interface ReviewerTake {
  reviewer: Reviewer;
  body: string;
}

export interface ReviewImage {
  id: string;
  url: string;
  alt: string;
  sortOrder: number;
  isCover: boolean;
}

export interface Review {
  id: string;
  slug: string;
  status: ReviewStatus;
  venue: Venue;
  visitDate: string;
  publishedAt: string | null;
  summary: string;
  story: string;
  verdict: string;
  burgerOrder: string;
  friesOrder: string | null;
  beerOrder: string | null;
  burgerPriceCents: number | null;
  baselineType: BaselineType;
  baselineNote: string;
  overallScore: number;
  ratings: Rating[];
  reviewerTakes: ReviewerTake[];
  images: ReviewImage[];
}

export interface CategoryScore {
  category: RatingCategory;
  score: number;
}

export interface ReviewerScorecard {
  reviewer: Reviewer;
  scores: CategoryScore[];
  weightedScore: number;
  take: string;
}
