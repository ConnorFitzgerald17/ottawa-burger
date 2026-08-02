import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, ExternalLink, MapPin } from "lucide-react";
import { BaselineStamp } from "@/components/baseline-stamp";
import { Scorecard } from "@/components/scorecard";
import { ScoreSeal } from "@/components/score-seal";
import { WhiskeySourReport } from "@/components/whiskey-sour-report";
import { getPublishedReviews, getReviewBySlug } from "@/lib/reviews";
import { calculateCategoryAverage, calculateReviewerScore } from "@/lib/scoring";
import type { ReviewerScorecard } from "@/lib/types";
import { directionsUrl, formatDate, formatPrice } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const reviews = await getPublishedReviews();
  return reviews.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const review = await getReviewBySlug(slug);
  if (!review) return { title: "Review not found" };
  const cover = review.images.find((image) => image.isCover) ?? review.images[0];
  return {
    title: `${review.venue.name} Burger Review`,
    description: `${review.overallScore.toFixed(1)}/10 — ${review.summary}`,
    alternates: { canonical: `/reviews/${review.slug}` },
    openGraph: { type: "article", title: `${review.venue.name}: ${review.overallScore.toFixed(1)}/10`, description: review.summary, images: cover ? [{ url: cover.url, alt: cover.alt }] : [{ url: `/reviews/${review.slug}/opengraph-image` }] },
  };
}

export default async function ReviewPage({ params }: { params: Params }) {
  const { slug } = await params;
  const review = await getReviewBySlug(slug);
  if (!review) notFound();
  const cover = review.images.find((image) => image.isCover) ?? review.images[0];
  const gallery = review.images.filter((image) => image.id !== cover?.id);
  const price = formatPrice(review.burgerPriceCents);
  const burgerScore = calculateCategoryAverage(review.ratings, "burger");
  const scorecards: ReviewerScorecard[] = review.reviewerTakes.map(({ reviewer, body }) => {
    const ratings = review.ratings.filter((rating) => rating.reviewerId === reviewer.id);
    return { reviewer, take: body, scores: ratings.map(({ category, score }) => ({ category, score })), weightedScore: calculateReviewerScore(ratings) ?? 0 };
  });
  const schema = {
    "@context": "https://schema.org", "@type": "Review", datePublished: review.publishedAt,
    reviewBody: review.verdict, reviewRating: { "@type": "Rating", ratingValue: review.overallScore, bestRating: 10, worstRating: 0 },
    itemReviewed: { "@type": "Restaurant", name: review.venue.name, address: review.venue.address },
    author: scorecards.map(({ reviewer }) => ({ "@type": "Person", name: reviewer.displayName })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <section className="review-hero">
        <div className="shell">
          <Link className="review-hero__crumb" href="/reviews"><ArrowLeft size={17}/> Back to all spots</Link>
          <div className="review-hero__grid">
            <div>
              <BaselineStamp type={review.baselineType} />
              <h1>{review.venue.name}</h1>
              <p className="review-hero__summary">{review.summary}</p>
              <div className="review-meta"><span><MapPin size={18}/>{review.venue.neighbourhood}</span><span><CalendarDays size={18}/>{formatDate(review.visitDate)}</span></div>
            </div>
            <div className="review-hero__photo">
              {cover ? <Image src={cover.url} alt={cover.alt} fill priority sizes="(max-width: 820px) 100vw, 45vw" /> : <div className="burger-placeholder"><span className="burger-placeholder__bun"/><span className="burger-placeholder__fill"/><span className="burger-placeholder__base"/></div>}
              <div className="review-hero__scores">
                <ScoreSeal score={review.overallScore}/>
                {burgerScore != null ? <ScoreSeal score={burgerScore} label="Burger score"/> : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell review-body-grid">
          <article className="story"><p className="eyebrow">The field report</p>{review.story.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</article>
          <aside className="order-ticket">
            <p className="eyebrow">Order docket</p><h2>What we tested</h2>
            <div className="ticket-row"><span>Burger</span><strong>{review.burgerOrder}</strong></div>
            {review.friesOrder ? <div className="ticket-row"><span>Fries</span><span>{review.friesOrder}</span></div> : null}
            {review.beerOrder ? <div className="ticket-row"><span>Beer</span><span>{review.beerOrder}</span></div> : null}
            {price ? <div className="ticket-row"><span>Burger price</span><span>{price}</span></div> : null}
            <div className="ticket-row"><span>Visited</span><span>{formatDate(review.visitDate)}</span></div>
            <div className="ticket-baseline"><BaselineStamp type={review.baselineType}/><p>{review.baselineNote}</p></div>
            <a className="button button--ink" href={directionsUrl(review.venue.address)} target="_blank" rel="noreferrer" style={{ marginTop: "1.5rem", width: "100%" }}>Get directions <ExternalLink size={17}/></a>
          </aside>
        </div>
      </section>

      {review.whiskeySourScore != null && review.whiskeySourNotes ? <WhiskeySourReport score={review.whiskeySourScore} notes={review.whiskeySourNotes} /> : null}

      <section className="section score-section">
        <div className="shell"><header className="section-heading"><div><p className="eyebrow">Two opinions, kept intact</p><h2>The scorecards</h2></div><p>Each reviewer scores the applicable categories. Burger owns 40%; everything else shares the remaining 60%.</p></header><div className="scorecards">{scorecards.map((scorecard) => <Scorecard key={scorecard.reviewer.id} scorecard={scorecard}/>)}</div></div>
      </section>

      <section className="verdict-band"><div className="shell verdict-grid"><div><p className="eyebrow">The combined verdict</p><h2>{review.overallScore.toFixed(1)} / 10</h2></div><p>{review.verdict}</p></div></section>

      {gallery.length ? <section className="section"><div className="shell"><header className="section-heading"><div><p className="eyebrow">Evidence from the table</p><h2>The camera roll</h2></div></header><div className="gallery-grid">{gallery.map((image) => <div className="gallery-item" key={image.id}><Image src={image.url} alt={image.alt} fill sizes="(max-width: 560px) 100vw, 60vw" /></div>)}</div></div></section> : null}
    </>
  );
}
