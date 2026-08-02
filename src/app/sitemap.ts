import type { MetadataRoute } from "next";
import { getPublishedReviews } from "@/lib/reviews";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const reviews = await getPublishedReviews();
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/reviews`, changeFrequency: "weekly", priority: .9 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: .6 },
    ...reviews.map((review) => ({ url: `${siteUrl}/reviews/${review.slug}`, lastModified: review.publishedAt ?? review.visitDate, changeFrequency: "monthly" as const, priority: .8 })),
  ];
}
