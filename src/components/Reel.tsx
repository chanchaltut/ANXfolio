import Link from "next/link";
import type { Brand, Category, Video } from "@/content/types";
import { Arrow } from "./Icons";
import { ReelSlider } from "./ReelSlider";
import { VideoCard } from "./VideoCard";

const CARD_SIZES = "(max-width: 700px) 72vw, 340px";

export function Reel({
  category,
  videos,
  brandOf,
  track,
}: {
  category: Category;
  videos: Video[];
  brandOf: (id?: string) => Brand | undefined;
  track: string;
}) {
  return (
    <section className="reel" id={category.slug} aria-labelledby={`${category.slug}-title`}>
      <span className="reel__ghost" aria-hidden="true">
        {category.label}
      </span>
      <header className="reel__head wrap" data-reveal>
        <p className="reel__track">
          <b>{track}</b> {String(videos.length).padStart(2, "0")} clips
        </p>
        <h3 id={`${category.slug}-title`} className="reel__title">
          {category.label}
        </h3>
        <p className="reel__blurb">{category.blurb}</p>
        <Link href={`/work/${category.slug}`} className="textlink">
          All {category.label} <Arrow />
        </Link>
      </header>
      <ReelSlider count={videos.length} label={category.label}>
        {videos.map((video, i) => (
          <VideoCard key={video.id} video={video} brand={brandOf(video.brandId)} sizes={CARD_SIZES} index={i} />
        ))}
      </ReelSlider>
    </section>
  );
}
