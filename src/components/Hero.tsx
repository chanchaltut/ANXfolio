import Image from "next/image";
import type { Settings, Video } from "@/content/types";
import { IMAGE_QUALITY } from "@/lib/images";
import { thumbnailUrl } from "@/lib/youtube";
import { Arrow } from "./Icons";
import { LOGO_H, LOGO_PATH, LOGO_W } from "./logo-path";

const COLUMNS = 6;
const PER_COLUMN = 3;

/** Uses the curated bright list, then fills from the remaining Shorts if videos were removed. */
function buildWall(videos: Video[], heroWall: string[]) {
  const shorts = videos.filter((v) => v.format === "short");
  const curated = heroWall.flatMap((id) => shorts.filter((v) => v.id === id));
  const rest = shorts.filter((v) => !heroWall.includes(v.id));
  const picks = [...curated, ...rest].slice(0, COLUMNS * PER_COLUMN);
  return Array.from({ length: COLUMNS }, (_, col) => picks.filter((_, i) => i % COLUMNS === col));
}

export function Hero({ videos, settings }: { videos: Video[]; settings: Settings }) {
  const wall = buildWall(videos, settings.heroWall);

  return (
    <section className="hero" id="top" data-scrub="hero" data-clip="Open">
      <div className="hero__stage">
        <div className="wall" aria-hidden="true">
          {wall.map((column, c) => (
            <div className="wall__col" key={c} style={{ "--k": (c % 3) + 1 } as React.CSSProperties}>
              <div className={`wall__run${c % 2 ? " wall__run--rev" : ""}`}>
                {[...column, ...column].map((video, i) => (
                  <div className="wall__tile" key={`${video.id}-${i}`}>
                    <Image
                      src={thumbnailUrl(video)}
                      alt=""
                      fill
                      // The rotated, scaled wall makes each tile about 24vw wide (40vw on phones).
                      sizes="(max-width: 700px) 40vw, 24vw"
                      quality={IMAGE_QUALITY.content}
                      // Columns 5 and 6 are hidden on phones, so only the first four load eagerly.
                      loading={i < column.length && c < 4 ? "eager" : "lazy"}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="hero__iris" aria-hidden="true">
          <svg className="iris" viewBox={`0 0 ${LOGO_W} ${LOGO_H}`}>
            <path fillRule="evenodd" d={`M-60000 -60000H60000V60000H-60000Z ${LOGO_PATH}`} />
          </svg>
        </div>

        <div className="hero__shade" aria-hidden="true" />

        <div className="hero__copy wrap--wide">
          <div className="hero__lead">
            <h1 className="hero__title">
              <span className="hero__eyebrow">Ayush Nayak · Video Editor</span>
              <span className="line">
                <span>Every frame</span>
              </span>{" "}
              <span className="line">
                <span>
                  earns the <em>next.</em>
                </span>
              </span>
            </h1>
          </div>
          <div className="hero__aside">
            <p className="hero__sub">
              Brand promos, fashion films and long-form stories, cut to hold attention.
              {settings.totalViews && (
                <>
                  {" "}
                  <strong>{settings.totalViews} views across Instagram.</strong>
                </>
              )}
            </p>
            <div className="hero__cta">
              <a href="#contact" className="btn btn--cyan btn--lg">
                Hire me <Arrow />
              </a>
              <a href="#work" className="btn btn--ghost btn--lg">
                Watch the work
              </a>
            </div>
          </div>
        </div>

        <p className="hero__end" aria-hidden="true">
          You stopped scrolling.
          <br />
          <em>That&rsquo;s the job.</em>
        </p>

        <span className="hero__bar hero__bar--top" aria-hidden="true" />
        <span className="hero__bar hero__bar--bottom" aria-hidden="true" />
      </div>
    </section>
  );
}
