"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { Archive, Eye, Save, Send } from "lucide-react";
import { saveReviewAction } from "@/app/admin/reviews/actions";
import { PhotoManager } from "@/components/photo-manager";
import { categoryLabels, ratingCategories, type Review, type Reviewer, type ReviewStatus } from "@/lib/types";
import { calculateOverallScore } from "@/lib/scoring";

interface AdminVenue {
  id: string;
  name: string;
  address: string;
  neighbourhood: string;
  website_url: string | null;
  phone: string | null;
  is_closed: boolean;
}

export function ReviewForm({ review, reviewers, venues, saved }: { review?: Review; reviewers: Reviewer[]; venues: AdminVenue[]; saved?: ReviewStatus }) {
  const [state, action, pending] = useActionState(saveReviewAction, {});
  const existingVenue = review ? venues.find((venue) => venue.id === review.venue.id) : undefined;
  const [venueId, setVenueId] = useState(existingVenue?.id ?? "");
  const selectedVenue = useMemo(() => venues.find((venue) => venue.id === venueId), [venues, venueId]);
  const [liveScores, setLiveScores] = useState<Record<string, string>>(() => Object.fromEntries(
    reviewers.flatMap((reviewer) => ratingCategories.map((category) => [
      `${reviewer.id}_${category}`,
      String(review?.ratings.find((rating) => rating.reviewerId === reviewer.id && rating.category === category)?.score ?? ""),
    ])),
  ));
  const liveOverall = calculateOverallScore(
    Object.entries(liveScores).flatMap(([key, raw]) => {
      if (raw === "") return [];
      const reviewer = reviewers.find(({ id }) => key.startsWith(`${id}_`));
      if (!reviewer) return [];
      const category = key.slice(reviewer.id.length + 1) as (typeof ratingCategories)[number];
      return [{ reviewerId: reviewer.id, category, score: Number(raw) }];
    }),
  );

  function score(reviewerId: string, category: string) {
    return review?.ratings.find((rating) => rating.reviewerId === reviewerId && rating.category === category)?.score ?? "";
  }
  function take(reviewerId: string) {
    return review?.reviewerTakes.find((item) => item.reviewer.id === reviewerId)?.body ?? "";
  }

  return <form className="review-form" action={action}>
    <input type="hidden" name="review_id" value={review?.id ?? ""}/>
    {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}
    {saved === "published" ? (
      <div className="publish-success" role="status">
        <div>
          <strong>Review published successfully!</strong>
          <span>It&apos;s live on Ottawa Burger Spot and the rankings are refreshed.</span>
        </div>
        {review ? <Link className="button button--paper" href={`/reviews/${review.slug}`} target="_blank">View live review <span aria-hidden="true">↗</span></Link> : null}
      </div>
    ) : null}
    {saved === "draft" ? <p className="form-success" role="status">Draft saved successfully.</p> : null}
    {saved === "archived" ? <p className="form-success" role="status">Review archived and removed from the public pages.</p> : null}

    <section className="form-section">
      <h2>01 · The restaurant</h2>
      <div className="form-grid">
        <div className="field field--full"><label htmlFor="venue-select">Use an existing spot</label><select id="venue-select" value={venueId} onChange={(event) => setVenueId(event.target.value)}><option value="">Create a new restaurant</option>{venues.map((venue) => <option key={venue.id} value={venue.id}>{venue.name} · {venue.neighbourhood}{venue.is_closed ? " · CLOSED" : ""}</option>)}</select><input type="hidden" name="venue_id" value={venueId}/></div>
        <div className="field"><label htmlFor="venue-name">Restaurant name</label><input id="venue-name" name="venue_name" required defaultValue={selectedVenue?.name ?? review?.venue.name ?? ""} key={`name-${venueId}`}/></div>
        <div className="field"><label htmlFor="venue-neighbourhood">Neighbourhood</label><input id="venue-neighbourhood" name="venue_neighbourhood" required defaultValue={selectedVenue?.neighbourhood ?? review?.venue.neighbourhood ?? ""} key={`neighbourhood-${venueId}`}/></div>
        <div className="field field--full"><label htmlFor="venue-address">Street address</label><input id="venue-address" name="venue_address" required defaultValue={selectedVenue?.address ?? review?.venue.address ?? ""} key={`address-${venueId}`}/></div>
        <div className="field"><label htmlFor="venue-website">Website</label><input id="venue-website" name="venue_website" type="url" defaultValue={selectedVenue?.website_url ?? review?.venue.websiteUrl ?? ""} key={`website-${venueId}`}/></div>
        <div className="field"><label htmlFor="venue-phone">Phone</label><input id="venue-phone" name="venue_phone" type="tel" defaultValue={selectedVenue?.phone ?? review?.venue.phone ?? ""} key={`phone-${venueId}`}/></div>
        <div className="field"><label htmlFor="venue-status">Operating status</label><select id="venue-status" name="venue_status" defaultValue={(selectedVenue?.is_closed ?? review?.venue.isClosed) ? "closed" : "open"} key={`status-${venueId}`}><option value="open">Currently operating</option><option value="closed">Permanently closed</option></select><p className="help">Closed spots stay public as historical field reports.</p></div>
      </div>
    </section>

    <section className="form-section">
      <h2>02 · The visit and baseline</h2>
      <div className="form-grid form-grid--3">
        <div className="field"><label htmlFor="visit-date">Visit date</label><input id="visit-date" name="visit_date" type="date" required defaultValue={review?.visitDate ?? new Date().toISOString().slice(0,10)}/></div>
        <div className="field"><label htmlFor="burger-price">Burger price (CAD)</label><input id="burger-price" name="burger_price" type="number" min="0" max="500" step="0.01" defaultValue={review?.burgerPriceCents != null ? review.burgerPriceCents / 100 : ""}/></div>
        <div className="field"><label htmlFor="baseline-type">Baseline status</label><select id="baseline-type" name="baseline_type" defaultValue={review?.baselineType ?? "original"}><option value="original">House original</option><option value="closest">Closest classic</option><option value="exception">House exception</option></select></div>
        <div className="field"><label htmlFor="burger-order">Burger tested</label><input id="burger-order" name="burger_order" required defaultValue={review?.burgerOrder ?? ""} placeholder="The Classic Cheeseburger"/></div>
        <div className="field"><label htmlFor="fries-order">Fries tested</label><input id="fries-order" name="fries_order" defaultValue={review?.friesOrder ?? ""} placeholder="House fries"/></div>
        <div className="field"><label htmlFor="beer-order">Beer tested</label><input id="beer-order" name="beer_order" defaultValue={review?.beerOrder ?? ""} placeholder="Optional"/></div>
        <div className="field"><label htmlFor="whiskey-sour-score">Whiskey sour score</label><input id="whiskey-sour-score" name="whiskey_sour_score" type="number" min="0" max="10" step="0.1" defaultValue={review?.whiskeySourScore ?? ""} placeholder="Optional"/><p className="help">Standalone score. This never changes the Spot score.</p></div>
        <div className="field field--full"><label htmlFor="whiskey-sour-notes">Whiskey sour tasting notes</label><textarea id="whiskey-sour-notes" name="whiskey_sour_notes" minLength={10} maxLength={1000} defaultValue={review?.whiskeySourNotes ?? ""} placeholder="Tartness, balance, foam, spirit, garnish…"/><p className="help">Optional, but score and notes must be completed together.</p></div>
        <div className="field field--full"><label htmlFor="baseline-note">Why this was the baseline</label><textarea id="baseline-note" name="baseline_note" required defaultValue={review?.baselineNote ?? ""} placeholder="The simplest burger on the menu, ordered as served…"/></div>
      </div>
    </section>

    <section className="form-section">
      <h2>03 · Shared field notes</h2>
      <div className="form-stack">
        <div className="field"><label htmlFor="summary">Card summary</label><textarea id="summary" name="summary" required minLength={20} maxLength={240} defaultValue={review?.summary ?? ""} style={{ minHeight: 90 }}/><p className="help">20–240 characters. This appears on cards and in search results.</p></div>
        <div className="field"><label htmlFor="story">Full review</label><textarea id="story" name="story" required minLength={40} maxLength={12000} defaultValue={review?.story ?? ""} style={{ minHeight: 320 }}/><p className="help">Separate paragraphs with a blank line.</p></div>
        <div className="field"><label htmlFor="verdict">Combined verdict</label><textarea id="verdict" name="verdict" required minLength={10} maxLength={1000} defaultValue={review?.verdict ?? ""}/></div>
      </div>
    </section>

    <section className="form-section">
      <h2>04 · Two scorecards <span className="score-preview">Live combined: {liveOverall?.toFixed(1) ?? "—"}</span></h2>
      <p className="help" style={{ marginBottom: "1.5rem" }}>Use 0.0–10.0 with any single decimal, including scores like 7.1, 8.6, or 9.9. Leave beer categories blank when they do not apply. Publishing requires a burger score and a final take of at least 5 characters from each reviewer.</p>
      <div className="rating-editor">{reviewers.map((reviewer) => <div className="rating-sheet" key={reviewer.id}><h3>{reviewer.displayName}&apos;s card</h3>{ratingCategories.map((category) => { const key = `${reviewer.id}_${category}`; return <div className="rating-row" key={category}><label htmlFor={`rating-${reviewer.id}-${category}`}>{categoryLabels[category]}</label><input id={`rating-${reviewer.id}-${category}`} name={`rating_${reviewer.id}_${category}`} type="number" min="0" max="10" step="0.1" value={liveScores[key] ?? score(reviewer.id, category)} onChange={(event) => setLiveScores((current) => ({ ...current, [key]: event.target.value }))}/></div>; })}<div className="field"><label htmlFor={`take-${reviewer.id}`}>Final take <span aria-hidden="true">·</span> required to publish</label><textarea id={`take-${reviewer.id}`} name={`take_${reviewer.id}`} defaultValue={take(reviewer.id)} placeholder="At least 5 characters with this reviewer’s personal verdict…"/><p className="help">Minimum 5 characters when publishing.</p></div></div>)}</div>
    </section>

    <section className="form-section">
      <h2>05 · Table photos</h2>
      {review ? <PhotoManager reviewId={review.id} images={review.images}/> : <div className="upload-drop"><span>Save the review as a draft once, then this section will accept and arrange photos.</span></div>}
    </section>

    <div className="form-actions">
      <Link className="button button--paper" href="/admin">Cancel</Link>
      {review ? <Link className="button button--paper" href={`/admin/reviews/${review.id}/preview`} target="_blank"><Eye size={18}/> Preview</Link> : null}
      {review ? <button className="button button--danger" name="intent" value="archived" disabled={pending}><Archive size={18}/> Archive</button> : null}
      <button className="button button--paper" name="intent" value="draft" disabled={pending}><Save size={18}/> {pending ? "Saving…" : "Save draft"}</button>
      <button className="button" name="intent" value="published" disabled={pending}><Send size={18}/> Publish</button>
    </div>
  </form>;
}
