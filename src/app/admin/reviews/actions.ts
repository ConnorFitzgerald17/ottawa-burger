"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireEditor } from "@/lib/admin";
import { calculateOverallScore } from "@/lib/scoring";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ratingCategories, type Rating, type ReviewStatus } from "@/lib/types";
import { slugify } from "@/lib/utils";

export type SaveReviewState = { error?: string };

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function saveReviewAction(_: SaveReviewState, formData: FormData): Promise<SaveReviewState> {
  const editor = await requireEditor();
  const supabase = await createSupabaseServerClient();
  const intent = value(formData, "intent") as ReviewStatus;
  const reviewId = value(formData, "review_id") || null;
  const { data: reviewerRows, error: reviewerError } = await supabase
    .from("reviewers")
    .select("id, display_name")
    .order("sort_order");
  if (reviewerError || !reviewerRows?.length) return { error: "The reviewer profiles could not be loaded." };
  const reviewerIds = reviewerRows.map(({ id }) => id);
  const visitDate = value(formData, "visit_date");
  const venueName = value(formData, "venue_name");
  const summary = value(formData, "summary");
  const story = value(formData, "story");
  const verdict = value(formData, "verdict");
  const burgerOrder = value(formData, "burger_order");
  const baselineNote = value(formData, "baseline_note");

  if (!venueName || !visitDate || summary.length < 20 || story.length < 40 || verdict.length < 5|| !burgerOrder || baselineNote.length < 5) {
    return { error: "Complete the restaurant, visit, story, verdict, burger, and baseline fields before saving." };
  }

  const ratings: Rating[] = [];
  for (const reviewerId of reviewerIds) {
    for (const category of ratingCategories) {
      const raw = value(formData, `rating_${reviewerId}_${category}`);
      if (!raw) continue;
      const score = Number(raw);
      if (!Number.isFinite(score) || score < 0 || score > 10 || Math.abs(score * 10 - Math.round(score * 10)) >= 1e-9) {
        return { error: "Scores must be between 0.0 and 10.0 with no more than one decimal place." };
      }
      ratings.push({ reviewerId, category, score });
    }
  }

  if (intent === "published") {
    const missingBurger = reviewerRows
      .filter(({ id }) => !ratings.some((rating) => rating.reviewerId === id && rating.category === "burger"))
      .map(({ display_name: name }) => name);
    if (missingBurger.length) {
      return { error: `Add a burger score for ${missingBurger.join(" and ")} before publishing.` };
    }

    const missingTake = reviewerRows
      .filter(({ id }) => value(formData, `take_${id}`).length < 5)
      .map(({ display_name: name }) => name);
    if (missingTake.length) {
      return { error: `Add a final take of at least 5 characters for ${missingTake.join(" and ")} before publishing.` };
    }
  }

  const overallScore = calculateOverallScore(ratings) ?? 0;
  let existingPublishedAt: string | null = null;
  let existingSlug: string | null = null;
  if (reviewId) {
    const { data: existing } = await supabase.from("reviews").select("published_at, slug").eq("id", reviewId).maybeSingle();
    existingPublishedAt = existing?.published_at ?? null;
    existingSlug = existing?.slug ?? null;
  }
  const restaurantSlug = slugify(venueName);
  let venueId = value(formData, "venue_id") || null;
  const venuePayload = {
    name: venueName,
    slug: restaurantSlug,
    address: value(formData, "venue_address"),
    neighbourhood: value(formData, "venue_neighbourhood"),
    website_url: value(formData, "venue_website") || null,
    phone: value(formData, "venue_phone") || null,
  };
  if (!venuePayload.address || !venuePayload.neighbourhood) return { error: "Add the restaurant address and neighbourhood." };

  if (venueId) {
    const { error } = await supabase.from("venues").update(venuePayload).eq("id", venueId);
    if (error) return { error: `Could not update the restaurant: ${error.message}` };
  } else {
    const { data, error } = await supabase.from("venues").insert(venuePayload).select("id").single();
    if (error || !data) return { error: `Could not create the restaurant: ${error?.message ?? "Unknown error"}` };
    venueId = data.id;
  }

  const reviewPayload = {
    venue_id: venueId,
    slug: restaurantSlug,
    visit_date: visitDate,
    summary,
    story,
    verdict,
    burger_order: burgerOrder,
    fries_order: value(formData, "fries_order") || null,
    beer_order: value(formData, "beer_order") || null,
    burger_price_cents: value(formData, "burger_price") ? Math.round(Number(value(formData, "burger_price")) * 100) : null,
    baseline_type: value(formData, "baseline_type"),
    baseline_note: baselineNote,
    overall_score: overallScore,
    status: intent,
    published_at: intent === "published" ? existingPublishedAt ?? new Date().toISOString() : null,
  };

  let savedId = reviewId;
  let savedSlug = "";
  if (reviewId) {
    const { data, error } = await supabase.from("reviews").update(reviewPayload).eq("id", reviewId).select("id, slug").single();
    if (error || !data) return { error: `Could not save the review: ${error?.message ?? "Unknown error"}` };
    savedSlug = data.slug;
  } else {
    const { data, error } = await supabase.from("reviews").insert({ ...reviewPayload, created_by: editor.user.id }).select("id, slug").single();
    if (error || !data) return { error: `Could not create the review: ${error?.message ?? "Unknown error"}` };
    savedId = data.id;
    savedSlug = data.slug;
  }

  const { error: deleteRatingsError } = await supabase.from("ratings").delete().eq("review_id", savedId!);
  if (deleteRatingsError) return { error: `Review saved, but scores could not update: ${deleteRatingsError.message}` };
  if (ratings.length) {
    const { error } = await supabase.from("ratings").insert(ratings.map((rating) => ({ review_id: savedId, reviewer_id: rating.reviewerId, category: rating.category, score: rating.score })));
    if (error) return { error: `Review saved, but scores could not update: ${error.message}` };
  }

  await supabase.from("reviewer_takes").delete().eq("review_id", savedId!);
  const takes = reviewerIds.map((reviewerId) => ({ review_id: savedId, reviewer_id: reviewerId, body: value(formData, `take_${reviewerId}`) })).filter((take) => take.body);
  if (takes.length) {
    const { error } = await supabase.from("reviewer_takes").insert(takes);
    if (error) return { error: `Review saved, but final takes could not update: ${error.message}` };
  }

  revalidatePath("/");
  revalidatePath("/reviews");
  if (existingSlug && existingSlug !== savedSlug) revalidatePath(`/reviews/${existingSlug}`);
  revalidatePath(`/reviews/${savedSlug}`);
  revalidatePath("/sitemap.xml");
  redirect(`/admin/reviews/${savedId}?saved=${intent}`);
}
