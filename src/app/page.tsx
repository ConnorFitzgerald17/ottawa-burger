import Link from "next/link";
import { ArrowRight, MapPin, NotebookPen, Scale, Utensils } from "lucide-react";
import { EmptyReviews } from "@/components/empty-reviews";
import { LoopingMarquee } from "@/components/looping-marquee";
import { ReviewCard } from "@/components/review-card";
import { getPublishedReviews } from "@/lib/reviews";

export default async function HomePage() {
  const reviews = await getPublishedReviews();
  const latest = reviews.slice(0, 2);
  const ranked = reviews.filter((review) => !review.venue.isClosed).sort((a, b) => b.overallScore - a.overallScore).slice(0, 4);

  return (
    <>
      <section className="hero">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Independent burger field notes · Ottawa, ON</p>
            <h1>We find the <span>good spot.</span></h1>
            <p className="lede">
              Connor and Alex order the closest thing to the house-original burger, score the whole visit,
              and leave no soggy fry unaccounted for.
            </p>
            <div className="hero-actions">
              <Link className="button" href="/reviews">Browse the spots <ArrowRight size={19} /></Link>
              <Link className="button button--paper" href="/about">See the scoring method</Link>
            </div>
          </div>
          <aside className="hero-note">
            <span className="hero-note__number">40%</span>
            <strong>The burger always gets the biggest say.</strong>
            <p>The remaining score is shared across fries, beer, selection, service, and atmosphere.</p>
          </aside>
        </div>
      </section>

      <LoopingMarquee
        items={[
          "Ottawa burger reviews",
          "Reviewed by Connor + Alex",
          "Two equal scorecards",
          "The simplest burger on the menu",
          "The same scoring system at every spot",
          "Independent · no paid reviews",
        ]}
      />

      <section className="section">
        <div className="shell">
          <header className="section-heading">
            <div><p className="eyebrow">Fresh off the griddle</p><h2>Latest field reports</h2></div>
            <p className="lede">The newest places we&apos;ve put through the baseline test—from neighbourhood counters to Ottawa institutions.</p>
          </header>
          {latest.length ? (
            <div className="review-grid">{latest.map((review) => <ReviewCard key={review.id} review={review} />)}</div>
          ) : (
            <EmptyReviews />
          )}
        </div>
      </section>

      <section className="section section--ink">
        <div className="shell method-grid">
          <div className="weight-visual" aria-label="The burger is weighted at 40 percent of each reviewer score">
            <div className="weight-visual__copy"><strong>40%</strong><span>burger first</span></div>
          </div>
          <div>
            <p className="eyebrow">A repeatable taste test</p>
            <h2>Original order. Honest score.</h2>
            <p className="lede" style={{ margin: "1.5rem 0 2rem", color: "#d8d0c3" }}>
              Signature towers can hide a lot. We start with the simplest house burger whenever possible,
              so every spot gets the same kind of test.
            </p>
            <div className="method-steps">
              <div className="method-step"><div><h3>Find the baseline</h3><p>The original, classic, or closest no-frills burger on the menu.</p></div></div>
              <div className="method-step"><div><h3>Score as equals</h3><p>Connor and Alex rate every applicable category independently, with equal weight in the verdict.</p></div></div>
              <div className="method-step"><div><h3>Combine the verdict</h3><p>Two opinions become one burger-first score—without sanding off the disagreement.</p></div></div>
            </div>
            <Link className="button" href="/about" style={{ marginTop: "2rem" }}>Read the full method <ArrowRight size={19} /></Link>
          </div>
        </div>
      </section>

      {ranked.length ? (
        <section className="section">
          <div className="shell">
            <header className="section-heading">
              <div><p className="eyebrow">The running order</p><h2>Ottawa&apos;s top spots</h2></div>
              <p>Ranked by the combined burger-first score. Ties go to the stronger burger.</p>
            </header>
            <div className="review-grid">{ranked.map((review, index) => <ReviewCard key={review.id} review={review} rank={index + 1} />)}</div>
          </div>
        </section>
      ) : null}

      <section className="section section--tomato">
        <div className="shell section-heading" style={{ marginBottom: 0 }}>
          <div><p className="eyebrow">Built for local appetites</p><h2>Know a spot?</h2></div>
          <div>
            <p className="lede">Keep an eye on the neighbourhood list. We&apos;re eating our way across Ottawa, one honest field report at a time.</p>
            <div className="review-meta" style={{ marginTop: "1.5rem" }}>
              <span><MapPin size={18}/> Neighbourhood filters</span><span><Scale size={18}/> Two scorecards</span><span><NotebookPen size={18}/> Independent notes</span><span><Utensils size={18}/> Baseline first</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
