import { About } from "@/components/About";
import { GenreTabs } from "@/components/GenreTabs";
import { Hero } from "@/components/Hero";
import { LongFormCarousel } from "@/components/LongFormCarousel";
import { Nav } from "@/components/Nav";
import { Reel } from "@/components/Reel";
import {
  BrandMarquee,
  Contact,
  FaqSection,
  Footer,
  LongFormIntro,
  Manifesto,
  MidCta,
  Pricing,
  Services,
  Testimonials,
  WorkIntro,
} from "@/components/Sections";
import { TimelineDock } from "@/components/TimelineDock";
import { brandLookup, getContent, getSiteMeta, getTestimonials, isLive } from "@/lib/content";
import { coreGraph, faqGraph, jsonLd, videoListGraph } from "@/lib/schema";

/**
 * The page follows AIDA:
 *   Attention  hero fly-through, brand strip
 *   Interest   manifesto, the editor and his numbers, the work itself
 *   Desire     services, view-count receipts, testimonials
 *   Action     pricing, FAQ to clear objections, the brief form
 *
 * Short-form genres share one tabbed section, so adding a genre doesn't add a screen of scrolling.
 */
export default async function HomePage() {
  const [{ categories, videos, brands, pricing, settings }, meta, testimonials] = await Promise.all([
    getContent(),
    getSiteMeta(),
    getTestimonials(),
  ]);
  const brandOf = brandLookup(brands);

  const live = categories.filter((c) => isLive(c, videos));
  const upcoming = categories.filter((c) => c.comingSoon);
  const shortForm = live.filter((c) => c.format === "short");
  const longCategories = new Set(live.filter((c) => c.format === "long").map((c) => c.slug));
  const longForm = videos.filter((v) => v.format === "long" && longCategories.has(v.category));

  const videosFor = (slug: string) => videos.filter((v) => v.category === slug);

  const structured = jsonLd([
    ...coreGraph(brands, { description: meta.description, sameAs: meta.sameAs, city: settings.city }),
    faqGraph(meta.faqs),
    videoListGraph(videos.filter((v) => live.some((c) => c.slug === v.category)), brandOf),
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structured }} />
      <Nav />
      <main id="main">
        <Hero videos={videos} settings={settings} />
        <BrandMarquee brands={brands} />
        <Manifesto />
        <About settings={settings} videoCount={videos.length} genreCount={live.length} />

        <section id="work" className="work" data-clip="Shorts" aria-label="Short videos">
          <WorkIntro />
          <GenreTabs
            tabs={shortForm.map((c) => ({ slug: c.slug, label: c.label, count: videosFor(c.slug).length }))}
            upcoming={upcoming.map((c) => c.label)}
          >
            {shortForm.map((category, i) => (
              <Reel
                key={category.slug}
                category={category}
                videos={videosFor(category.slug)}
                brandOf={brandOf}
                track={`V${i + 1}`}
              />
            ))}
          </GenreTabs>
        </section>

        {longForm.length > 0 && (
          <section id="long-form" className="longform" data-clip="Long" aria-label="Long form videos">
            <LongFormIntro />
            <LongFormCarousel videos={longForm} />
          </section>
        )}

        <MidCta />
        <Services videos={videos} live={live} />
        <Testimonials videos={videos} brandOf={brandOf} testimonials={testimonials} />
        <Pricing tiers={pricing} />
        <FaqSection faqs={meta.faqs} description={meta.description} />
        <Contact categories={live} pricing={pricing} settings={settings} />
      </main>
      <Footer categories={live} meta={meta} />
      <TimelineDock />
    </>
  );
}
