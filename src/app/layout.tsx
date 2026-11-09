import type { Metadata, Viewport } from "next";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import { site } from "@/content/site";
import { getSiteMeta } from "@/lib/content";
import "./globals.css";

const sans = Inter_Tight({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap", weight: ["400", "500"] });

const title = `${site.person} (ANX) | Video Editor for Brands, Reels & Long Form`;

export async function generateMetadata(): Promise<Metadata> {
  const { description } = await getSiteMeta();
  return {
    metadataBase: new URL(site.url),
    title: { default: title, template: `%s | ${site.person} (ANX)` },
    description,
    applicationName: "ANX",
    authors: [{ name: site.person, url: site.url }],
    creator: site.person,
    alternates: { canonical: "/" },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-video-preview": -1, "max-snippet": -1 },
    },
    openGraph: { type: "website", url: "/", siteName: "ANX", title, description, locale: "en_IN" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export const viewport: Viewport = {
  themeColor: "#00090f",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        {/* Animated-in content starts hidden only when JavaScript can reveal it again. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
