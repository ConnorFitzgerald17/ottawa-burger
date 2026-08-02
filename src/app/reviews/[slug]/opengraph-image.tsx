import { ImageResponse } from "next/og";
import { getReviewBySlug } from "@/lib/reviews";

export const alt = "Ottawa Burger Spot review scorecard";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function ReviewOpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const review = await getReviewBySlug(slug);
  const name = review?.venue.name ?? "Ottawa Burger Spot";
  const score = review?.overallScore.toFixed(1) ?? "—";
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", padding: 62, background: "#d83a25", color: "#fffaf0", border: "24px solid #211d18", fontFamily: "sans-serif" }}><div style={{ width: "72%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}><span style={{ fontSize: 25, fontWeight: 800, letterSpacing: 4 }}>OTTAWA BURGER SPOT · FIELD REPORT</span><span style={{ fontSize: 78, lineHeight: .95, fontWeight: 900, textTransform: "uppercase" }}>{name}</span><span style={{ fontSize: 28 }}>Two scorecards. One burger-first verdict.</span></div><div style={{ width: "28%", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: 250, height: 250, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: 999, border: "9px double #211d18", background: "#f1b92f", color: "#211d18", transform: "rotate(-5deg)" }}><span style={{ fontSize: 23, fontWeight: 800 }}>SPOT SCORE</span><strong style={{ fontSize: 104, lineHeight: 1 }}>{score}</strong></div></div></div>, size);
}
