import type { Brand, Video } from "@/content/types";
import { BrandMark } from "./BrandMark";
import { ViewCount } from "./Icons";
import { Logo } from "./Logo";
import { VideoFacade } from "./VideoFacade";

export function VideoCard({
  video,
  brand,
  sizes,
  index = 0,
}: {
  video: Video;
  brand?: Brand;
  sizes: string;
  index?: number;
}) {
  return (
    <article className="vcard" data-reveal style={{ "--d": `${Math.min(index, 3) * 70}ms` } as React.CSSProperties}>
      <VideoFacade video={video} sizes={sizes} />
      <footer className="vcard__foot">
        {brand ? (
          <BrandMark brand={brand} />
        ) : (
          <span className="vcard__anon">
            <Logo className="vcard__mark" />
            <span>{video.title}</span>
          </span>
        )}
        {video.views && <ViewCount views={video.views} source={video.viewsSource} />}
      </footer>
    </article>
  );
}
