import { cache } from "react";
import { createSupabasePublicClient, createSupabaseServerClient, hasSupabaseConfig } from "@/lib/supabase/server";
import type {
  BaselineType,
  Rating,
  RatingCategory,
  Review,
  Reviewer,
  ReviewImage,
  ReviewStatus,
  ReviewerTake,
  Venue,
} from "@/lib/types";

export const defaultReviewers: Reviewer[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    slug: "connor",
    displayName: "Connor",
    bio: "Main reviewer. Tracks the sear, seasoning, structure, and whether the fries stay crisp.",
    avatarUrl: null,
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    slug: "alex",
    displayName: "Alex",
    bio: "Main reviewer. Tracks balance, execution, atmosphere, and how the whole visit comes together.",
    avatarUrl: null,
  },
];

interface DbReviewRow {
  id: string;
  slug: string;
  status: ReviewStatus;
  visit_date: string;
  published_at: string | null;
  summary: string;
  story: string;
  verdict: string;
  burger_order: string;
  fries_order: string | null;
  beer_order: string | null;
  whiskey_sour_score: number | string | null;
  whiskey_sour_notes: string | null;
  burger_price_cents: number | null;
  baseline_type: BaselineType;
  baseline_note: string;
  overall_score: number | string;
  venue: {
    id: string;
    name: string;
    slug: string;
    address: string;
    neighbourhood: string;
    website_url: string | null;
    phone: string | null;
  };
  ratings: Array<{ reviewer_id: string; category: RatingCategory; score: number | string }>;
  review_images: Array<{
    id: string;
    storage_path: string;
    alt: string;
    sort_order: number;
    is_cover: boolean;
  }>;
  reviewer_takes: Array<{
    body: string;
    reviewer: {
      id: string;
      slug: string;
      display_name: string;
      bio: string;
      avatar_path: string | null;
    };
  }>;
}

const reviewSelect = `
  id, slug, status, visit_date, published_at, summary, story, verdict,
  burger_order, fries_order, beer_order, whiskey_sour_score, whiskey_sour_notes,
  burger_price_cents,
  baseline_type, baseline_note, overall_score,
  venue:venues!inner(id, name, slug, address, neighbourhood, website_url, phone),
  ratings(reviewer_id, category, score),
  review_images(id, storage_path, alt, sort_order, is_cover),
  reviewer_takes(body, reviewer:reviewers(id, slug, display_name, bio, avatar_path))
`;

function storageUrl(path: string | null) {
  if (!path || !process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/review-media/${path}`;
}

function mapReview(row: DbReviewRow): Review {
  const venue: Venue = {
    id: row.venue.id,
    name: row.venue.name,
    slug: row.venue.slug,
    address: row.venue.address,
    neighbourhood: row.venue.neighbourhood,
    websiteUrl: row.venue.website_url,
    phone: row.venue.phone,
  };

  const ratings: Rating[] = row.ratings.map((rating) => ({
    reviewerId: rating.reviewer_id,
    category: rating.category,
    score: Number(rating.score),
  }));

  const reviewerTakes: ReviewerTake[] = row.reviewer_takes.map((take) => ({
    body: take.body,
    reviewer: {
      id: take.reviewer.id,
      slug: take.reviewer.slug,
      displayName: take.reviewer.display_name,
      bio: take.reviewer.bio,
      avatarUrl: storageUrl(take.reviewer.avatar_path),
    },
  }));

  const images: ReviewImage[] = row.review_images
    .map((image) => ({
      id: image.id,
      url: storageUrl(image.storage_path) ?? "",
      alt: image.alt,
      sortOrder: image.sort_order,
      isCover: image.is_cover,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    id: row.id,
    slug: row.slug,
    status: row.status,
    venue,
    visitDate: row.visit_date,
    publishedAt: row.published_at,
    summary: row.summary,
    story: row.story,
    verdict: row.verdict,
    burgerOrder: row.burger_order,
    friesOrder: row.fries_order,
    beerOrder: row.beer_order,
    whiskeySourScore: row.whiskey_sour_score == null ? null : Number(row.whiskey_sour_score),
    whiskeySourNotes: row.whiskey_sour_notes,
    burgerPriceCents: row.burger_price_cents,
    baselineType: row.baseline_type,
    baselineNote: row.baseline_note,
    overallScore: Number(row.overall_score),
    ratings,
    reviewerTakes,
    images,
  };
}

export const getPublishedReviews = cache(async (): Promise<Review[]> => {
  if (!hasSupabaseConfig()) return [];
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(reviewSelect)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Unable to load reviews", error.message);
    return [];
  }

  return (data as unknown as DbReviewRow[]).map(mapReview);
});

export const getReviewBySlug = cache(async (slug: string): Promise<Review | null> => {
  if (!hasSupabaseConfig()) return null;
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(reviewSelect)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) return null;
  return mapReview(data as unknown as DbReviewRow);
});

export const getReviewers = cache(async (): Promise<Reviewer[]> => {
  if (!hasSupabaseConfig()) return defaultReviewers;
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("reviewers")
    .select("id, slug, display_name, bio, avatar_path")
    .order("sort_order");

  if (error || !data?.length) return defaultReviewers;
  return data.map((reviewer) => ({
    id: reviewer.id,
    slug: reviewer.slug,
    displayName: reviewer.display_name,
    bio: reviewer.bio,
    avatarUrl: storageUrl(reviewer.avatar_path),
  }));
});

export async function getAdminReview(id: string): Promise<Review | null> {
  if (!hasSupabaseConfig()) return null;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(reviewSelect)
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return mapReview(data as unknown as DbReviewRow);
}
