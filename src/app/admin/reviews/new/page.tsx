import type { Metadata } from "next";
import { AdminTopbar } from "@/components/admin-topbar";
import { ReviewForm } from "@/components/review-form";
import { getAdminVenues, requireEditor } from "@/lib/admin";
import { getReviewers } from "@/lib/reviews";

export const metadata: Metadata = { title: "New review", robots: { index: false, follow: false } };

export default async function NewReviewPage() {
  await requireEditor();
  const [venues, reviewers] = await Promise.all([getAdminVenues(), getReviewers()]);
  return <div className="admin-shell"><AdminTopbar/><div className="shell admin-content"><header className="admin-heading"><div><p className="eyebrow">New field report</p><h1>Load the scorecard.</h1></div></header><ReviewForm venues={venues} reviewers={reviewers}/></div></div>;
}
