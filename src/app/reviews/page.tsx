import type { Metadata } from "next";
import { Search } from "lucide-react";
import { EmptyReviews } from "@/components/empty-reviews";
import { ReviewCard } from "@/components/review-card";
import { calculateCategoryAverage } from "@/lib/scoring";
import { getPublishedReviews } from "@/lib/reviews";
import type { RatingCategory } from "@/lib/types";

export const metadata: Metadata = {
  title: "Ottawa Burger Reviews",
  description: "Search and rank independent Ottawa burger reviews by neighbourhood, date, and score.",
};

type SearchParams = Promise<{ q?: string; neighbourhood?: string; sort?: string }>;

export default async function ReviewsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const allReviews = await getPublishedReviews();
  const q = (params.q ?? "").trim().toLowerCase();
  const neighbourhood = params.neighbourhood ?? "";
  const sort = params.sort ?? "newest";
  const neighbourhoods = [...new Set(allReviews.map((review) => review.venue.neighbourhood))].sort();

  const scoreCategory = sort.startsWith("category:") ? (sort.replace("category:", "") as RatingCategory) : null;
  const reviews = allReviews
    .filter((review) => {
      const haystack = `${review.venue.name} ${review.venue.neighbourhood} ${review.burgerOrder}`.toLowerCase();
      return (!q || haystack.includes(q)) && (!neighbourhood || review.venue.neighbourhood === neighbourhood);
    })
    .sort((a, b) => {
      if (sort === "highest") return b.overallScore - a.overallScore;
      if (sort === "oldest") return a.visitDate.localeCompare(b.visitDate);
      if (scoreCategory) return (calculateCategoryAverage(b.ratings, scoreCategory) ?? -1) - (calculateCategoryAverage(a.ratings, scoreCategory) ?? -1);
      return b.visitDate.localeCompare(a.visitDate);
    });

  return (
    <>
      <section className="page-hero">
        <div className="shell page-hero__row">
          <div><p className="eyebrow">The Ottawa index</p><h1>Every spot, on the record.</h1></div>
          <p>Search the field notes, choose a neighbourhood, or sort the list by the score that matters to you.</p>
        </div>
      </section>
      <div className="filter-bar">
        <form className="shell filter-form" action="/reviews">
          <div className="field"><label htmlFor="q">Search</label><input id="q" name="q" defaultValue={params.q} placeholder="Restaurant, burger, neighbourhood…" /></div>
          <div className="field"><label htmlFor="neighbourhood">Neighbourhood</label><select id="neighbourhood" name="neighbourhood" defaultValue={neighbourhood}><option value="">All Ottawa</option>{neighbourhoods.map((item) => <option key={item}>{item}</option>)}</select></div>
          <div className="field"><label htmlFor="sort">Sort by</label><select id="sort" name="sort" defaultValue={sort}><option value="newest">Newest visit</option><option value="oldest">Oldest visit</option><option value="highest">Highest overall</option><option value="category:burger">Best burger</option><option value="category:fries">Best fries</option><option value="category:beer">Best beer</option><option value="category:beer_selection">Best beer selection</option><option value="category:service">Best service</option><option value="category:atmosphere">Best atmosphere</option></select></div>
          <button className="button button--ink" type="submit"><Search size={18}/> Apply</button>
        </form>
      </div>
      <section className="section">
        <div className="shell">
          <p className="filter-count">Showing {reviews.length} of {allReviews.length} field {allReviews.length === 1 ? "report" : "reports"}</p>
          {reviews.length ? <div className="review-grid">{reviews.map((review) => <ReviewCard key={review.id} review={review} />)}</div> : <EmptyReviews filtered={Boolean(q || neighbourhood)} />}
        </div>
      </section>
    </>
  );
}
