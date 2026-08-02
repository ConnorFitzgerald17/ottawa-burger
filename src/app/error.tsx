"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <section className="section"><div className="empty-state"><p className="eyebrow">Kitchen error</p><h1 style={{ fontSize: "clamp(3rem,8vw,7rem)" }}>We dropped the order.</h1><p>Something went wrong while loading these field notes.</p><button className="button button--ink" onClick={reset}>Try again</button></div></section>;
}
