import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { LoopingMarquee } from "@/components/looping-marquee";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <BrandMark className="footer-mark" />
          <p className="eyebrow">Field notes from Canada&apos;s capital</p>
          <p className="footer-kicker">Two friends. One baseline burger.</p>
        </div>
        <div className="footer-links">
          <Link href="/reviews">All reviews</Link>
          <Link href="/about">The scoring method</Link>
          <a href="mailto:ottawaburgerspot@gmail.com">ottawaburgerspot@gmail.com</a>
          <Link href="/admin/login">Editor sign-in</Link>
        </div>
        <p className="footer-small">
          Independent reviews. No paid placements. Just burgers, fries, beer, and the honest scorecard.
        </p>
      </div>
      <LoopingMarquee
        tone="tomato"
        items={[
          "Burger",
          "Fries",
          "Beer",
          "Beer selection",
          "Service",
          "Atmosphere",
          "Two equal reviewers",
          "The final verdict",
          "Ottawa, Ontario",
        ]}
      />
    </footer>
  );
}
