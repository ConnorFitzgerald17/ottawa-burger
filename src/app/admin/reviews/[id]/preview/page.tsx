import Image from "next/image";
import { notFound } from "next/navigation";
import { Scorecard } from "@/components/scorecard";
import { ScoreSeal } from "@/components/score-seal";
import { WhiskeySourReport } from "@/components/whiskey-sour-report";
import { requireEditor } from "@/lib/admin";
import { getAdminReview } from "@/lib/reviews";
import { calculateCategoryAverage, calculateReviewerScore } from "@/lib/scoring";

export default async function DraftPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireEditor();
  const { id } = await params;
  const review = await getAdminReview(id);
  if (!review) notFound();
  const cover = review.images.find((image) => image.isCover) ?? review.images[0];
  const burgerScore = calculateCategoryAverage(review.ratings, "burger");
  const cards = review.reviewerTakes.map(({ reviewer, body }) => { const ratings = review.ratings.filter((rating) => rating.reviewerId === reviewer.id); return { reviewer, take: body, scores: ratings.map(({ category, score }) => ({ category, score })), weightedScore: calculateReviewerScore(ratings) ?? 0 }; });
  return <div className="admin-shell"><div className="review-hero"><div className="shell"><p className="status-chip status-chip--draft" style={{ color: "var(--ink)" }}>Private {review.status} preview</p><div className="review-hero__grid" style={{ marginTop: "2rem" }}><div><h1>{review.venue.name}</h1><p className="review-hero__summary">{review.summary}</p></div><div className="review-hero__photo">{cover ? <Image src={cover.url} alt={cover.alt} fill sizes="45vw"/> : <div className="burger-placeholder"><span className="burger-placeholder__bun"/><span className="burger-placeholder__fill"/><span className="burger-placeholder__base"/></div>}<div className="review-hero__scores"><ScoreSeal score={review.overallScore}/>{burgerScore != null ? <ScoreSeal score={burgerScore} label="Burger score"/> : null}</div></div></div></div></div><section className="section"><div className="shell review-body-grid"><article className="story">{review.story.split(/\n\s*\n/).filter(Boolean).map((paragraph,index) => <p key={index}>{paragraph}</p>)}</article><aside className="order-ticket"><p className="eyebrow">Combined verdict</p><p>{review.verdict}</p></aside></div></section>{review.whiskeySourScore != null && review.whiskeySourNotes ? <WhiskeySourReport score={review.whiskeySourScore} notes={review.whiskeySourNotes}/> : null}<section className="section score-section"><div className="shell"><div className="scorecards">{cards.map((card) => <Scorecard key={card.reviewer.id} scorecard={card}/>)}</div></div></section></div>;
}
