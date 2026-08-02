import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";

export function EmptyReviews({ filtered = false }: { filtered?: boolean }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon"><UtensilsCrossed /></div>
      <p className="eyebrow">{filtered ? "No matching field notes" : "The griddle is heating up"}</p>
      <h2>{filtered ? "Try a wider search." : "First verdict coming soon."}</h2>
      <p>
        {filtered
          ? "Clear a filter or search a different restaurant, burger, or neighbourhood."
          : "Connor and Alex are working through Ottawa one baseline burger at a time."}
      </p>
      {filtered ? <Link className="button button--ink" href="/reviews">Clear all filters</Link> : null}
    </div>
  );
}
