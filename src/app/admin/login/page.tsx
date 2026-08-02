import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Editor sign-in", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  return <div className="login-page"><div className="login-card"><BrandMark style={{ width: 58, color: "var(--tomato)" }}/><p className="eyebrow">Private editor</p><h1>Back to the docket.</h1><p>Sign in to add a field report, adjust a scorecard, or publish a review.</p><LoginForm next={params.next ?? "/admin"}/><p className="help" style={{ marginTop: "1.5rem" }}><Link className="text-link" href="/">← Return to the public site</Link></p></div></div>;
}
