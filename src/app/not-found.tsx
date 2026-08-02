import Link from "next/link";

export default function NotFound() {
  return <section className="section"><div className="empty-state"><p className="eyebrow">404 · Missing order</p><h1 style={{ fontSize: "clamp(3rem,8vw,7rem)" }}>This spot isn&apos;t on the docket.</h1><p>The review may still be a draft, or the link took a wrong turn.</p><Link className="button button--ink" href="/reviews">Back to all reviews</Link></div></section>;
}
