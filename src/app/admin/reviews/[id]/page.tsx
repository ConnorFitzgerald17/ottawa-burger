import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminTopbar } from "@/components/admin-topbar";
import { ReviewForm } from "@/components/review-form";
import { getAdminVenues, requireEditor } from "@/lib/admin";
import { getAdminReview, getReviewers } from "@/lib/reviews";
import type { ReviewStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Edit review", robots: { index: false, follow: false } };

export default async function EditReviewPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  await requireEditor();
  const { id } = await params;
  const [review, venues, reviewers, query] = await Promise.all([getAdminReview(id), getAdminVenues(), getReviewers(), searchParams]);
  if (!review) notFound();
  const saved = (["draft", "published", "archived"] as ReviewStatus[]).includes(query.saved as ReviewStatus)
    ? query.saved as ReviewStatus
    : undefined;
  return <div className="admin-shell"><AdminTopbar/><div className="shell admin-content"><header className="admin-heading"><div><p className="eyebrow">Editing {review.status} report</p><h1>{review.venue.name}</h1></div></header><ReviewForm review={review} venues={venues} reviewers={reviewers} saved={saved}/></div></div>;
}
