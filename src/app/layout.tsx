import type { Metadata } from "next";
import "@fontsource/bowlby-one/400.css";
import "@fontsource/atkinson-hyperlegible/400.css";
import "@fontsource/atkinson-hyperlegible/700.css";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Ottawa Burger Spot", template: "%s | Ottawa Burger Spot" },
  description: "Connor and Alex review Ottawa burgers using one honest, repeatable baseline.",
  openGraph: {
    type: "website",
    locale: "en_CA",
    siteName: "Ottawa Burger Spot",
    title: "Ottawa Burger Spot",
    description: "Two friends. One baseline burger. Ottawa’s spots, scored properly.",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
