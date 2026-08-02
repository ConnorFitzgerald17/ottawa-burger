import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell site-header__inner">
        <Link className="wordmark" href="/" aria-label="Ottawa Burger Spot home">
          <BrandMark />
          <span>
            Ottawa Burger <em>Spot</em>
          </span>
        </Link>
        <nav aria-label="Main navigation">
          <Link href="/reviews">The spots</Link>
          <Link href="/about">Our method</Link>
          <Link className="nav-stamp" href="/reviews?sort=highest">
            Top scores
          </Link>
        </nav>
      </div>
    </header>
  );
}
