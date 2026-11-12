import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Arrow } from "@/components/Icons";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Sections";
import { VideoCard } from "@/components/VideoCard";
import { shareImage, site } from "@/content/site";
import { brandLookup, getContent, getSiteMeta, isLive } from "@/lib/content";
import { breadcrumbGraph, jsonLd, videoListGraph } from "@/lib/schema";

type Props = { params: Promise<{ slug: string }> };

/** Genres made live in the admin after the build are rendered on first visit, then cached. */
export const dynamicParams = true;

export async function generateStaticParams() {
  const { categories, videos } = await getContent();
  return categories.filter((c) => isLive(c, videos)).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { categories, videos } = await getContent();
  const category = categories.find((c) => c.slug === slug);
  if (!category || !isLive(category, videos)) return {};
  return {
    title: category.seoTitle,
    description: category.seoDescription,
    alternates: { canonical: `/work/${category.slug}` },
    openGraph: {
      type: "website",
      siteName: "ANX",
      locale: "en_IN",
      url: `/work/${category.slug}`,
      title: `${category.seoTitle} | ${site.person} (ANX)`,
      description: category.seoDescription,
      images: [shareImage],
    },
    twitter: {
      card: "summary_large_image",
      title: `${category.seoTitle} | ${site.person} (ANX)`,
      description: category.seoDescription,
      images: [shareImage],
    },
  };
}

export default async function WorkCategoryPage({ params }: Props) {
  const { slug } = await params;
  const [content, meta] = await Promise.all([getContent(), getSiteMeta()]);
  const category = content.categories.find((c) => c.slug === slug);
  if (!category || !isLive(category, content.videos)) notFound();

  const videos = content.videos.filter((v) => v.category === slug);
  const categories = content.categories.filter((c) => isLive(c, content.videos));
  const brandOf = brandLookup(content.brands);
  const others = categories.filter((c) => c.slug !== slug);
  const structured = jsonLd([breadcrumbGraph(category), videoListGraph(videos, brandOf, category.slug)]);
  const isLong = category.format === "long";

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structured }} />
      <Nav base="/" />
      <main id="main" className="catpage">
        <header className="catpage__head wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link> / <Link href="/#work">Work</Link> / <span>{category.label}</span>
          </nav>
          <h1 className="h2">
            {category.label}, <em>edited by ANX</em>
          </h1>
          <p className="lede">{category.seoDescription}</p>
        </header>

        <div className={`catgrid wrap${isLong ? " catgrid--long" : ""}`}>
          {videos.map((video, i) => (
            <VideoCard
              key={video.id}
              video={video}
              brand={brandOf(video.brandId)}
              index={i}
              sizes={isLong ? "(max-width: 900px) 92vw, 540px" : "(max-width: 700px) 46vw, 340px"}
            />
          ))}
        </div>

        <section className="catnext wrap" aria-label="Next steps">
          <div className="catnext__cta">
            <h2>Want this for your brand?</h2>
            <Link href="/#contact" className="btn btn--cyan btn--lg">
              Hire me <Arrow />
            </Link>
          </div>
          <div className="catnext__links">
            <p className="footer__h">More genres</p>
            {others.map((c) => (
              <Link key={c.slug} href={`/work/${c.slug}`} className="textlink">
                {c.label} <Arrow />
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer categories={categories} meta={meta} base="/" />
    </>
  );
}
