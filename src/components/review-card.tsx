import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { BaselineStamp } from "@/components/baseline-stamp";
import { ScoreSeal } from "@/components/score-seal";
import { calculateCategoryAverage } from "@/lib/scoring";
import type { Review } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function ReviewCard({ review, rank }: { review: Review; rank?: number }) {
  const cover = review.images.find((image) => image.isCover) ?? review.images[0];
  const burgerScore = calculateCategoryAverage(review.ratings, "burger");
  return (
    <article className="review-card">
      <Link href={`/reviews/${review.slug}`} className="review-card__image" tabIndex={-1}>
        {cover ? (
          <Image src={cover.url} alt={cover.alt} fill sizes="(max-width: 800px) 100vw, 50vw" />
        ) : (
          <div className="burger-placeholder" aria-hidden="true">
            <span className="burger-placeholder__bun" />
            <span className="burger-placeholder__fill" />
            <span className="burger-placeholder__base" />
          </div>
        )}
        {rank ? <span className="rank-tab">#{rank}</span> : null}
      </Link>
      <div className="review-card__paper">
        <div className="review-card__top">
          <div className="review-card__meta">
            <span><MapPin size={15} /> {review.venue.neighbourhood}</span>
            <time dateTime={review.visitDate}>{formatDate(review.visitDate)}</time>
          </div>
          <div className="review-card__scores">
            <ScoreSeal score={review.overallScore} size="small" />
            {burgerScore != null ? <ScoreSeal score={burgerScore} size="small" label="Burger score" /> : null}
          </div>
        </div>
        <BaselineStamp type={review.baselineType} />
        <h3>
          <Link href={`/reviews/${review.slug}`}>{review.venue.name}</Link>
        </h3>
        <p className="review-card__order">Tested: {review.burgerOrder}</p>
        <p>{review.summary}</p>
        <Link className="text-link" href={`/reviews/${review.slug}`}>
          Open the field report <ArrowUpRight size={18} />
        </Link>
      </div>
    </article>
  );
}
