import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminTopbar } from "@/components/admin-topbar";
import { getAdminReviewList, requireEditor } from "@/lib/admin";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Review dashboard", robots: { index: false, follow: false } };

export default async function AdminPage() {
  await requireEditor();
  const reviews = await getAdminReviewList();
  return <div className="admin-shell"><AdminTopbar/><div className="shell admin-content"><header className="admin-heading"><div><p className="eyebrow">Private field desk</p><h1>Review docket</h1></div><Link className="button" href="/admin/reviews/new"><Plus size={19}/> New review</Link></header>{reviews.length ? <div className="admin-card"><table className="admin-list"><thead><tr><th>Restaurant</th><th>Status</th><th>Visit</th><th>Score</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{reviews.map((review) => { const venue = Array.isArray(review.venue) ? review.venue[0] : review.venue; return <tr key={review.id}><td><strong>{venue?.name ?? "Untitled venue"}</strong>{venue?.is_closed ? <span className="status-chip status-chip--closed">Closed</span> : null}</td><td><span className={`status-chip status-chip--${review.status}`}>{review.status}</span></td><td>{formatDate(review.visit_date)}</td><td><strong>{Number(review.overall_score).toFixed(1)}</strong></td><td><Link className="text-link" href={`/admin/reviews/${review.id}`}>Edit report →</Link></td></tr>; })}</tbody></table></div> : <div className="empty-state"><p className="eyebrow">Nothing on the pass</p><h2>Start the first report.</h2><p>Create a draft, add both scorecards, then upload the evidence.</p><Link className="button button--ink" href="/admin/reviews/new">Add a review</Link></div>}</div></div>;
}
