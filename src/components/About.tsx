import Image, { type StaticImageData } from "next/image";
import forest from "@/assets/ayush/frame-forest.jpg";
import lights from "@/assets/ayush/frame-lights.jpg";
import night from "@/assets/ayush/frame-night.jpg";
import road from "@/assets/ayush/frame-road.jpg";
import windowLight from "@/assets/ayush/frame-window.jpg";
import still from "@/assets/ayush/portrait-anx.jpg";
import studio from "@/assets/ayush/portrait-studio.jpg";
import type { Settings } from "@/content/types";
import { IMAGE_QUALITY } from "@/lib/images";
import { Arrow } from "./Icons";
import { Slate } from "./Sections";

const FRAMES: { src: StaticImageData; alt: string; clip: string }[] = [
  { src: lights, alt: "Ayush Nayak under stage lights at a night event", clip: "A002_C014" },
  { src: forest, alt: "Ayush Nayak in an orange jacket among trees", clip: "A002_C021" },
  { src: windowLight, alt: "Ayush Nayak in a checked shirt in warm evening light", clip: "A003_C007" },
  { src: road, alt: "Ayush Nayak smiling by the road", clip: "A003_C019" },
  { src: night, alt: "Ayush Nayak between white pillars at night", clip: "A004_C002" },
];

/** The person behind the edits: portrait in a camera viewfinder, a bio, and a drifting filmstrip. */
export function About({ settings }: { settings: Settings }) {
  const paragraphs = settings.about.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  // Two runs of the same frames, so the strip never shows an edge while it drifts.
  const strip = [...FRAMES, ...FRAMES];

  return (
    <section className="about" id="about" data-clip="Editor" aria-labelledby="about-title">
      <div className="wrap about__grid">
        <div className="about__media" data-reveal>
          <figure className="about__portrait">
            <Image
              src={studio}
              alt="Portrait of Ayush Nayak, video editor"
              placeholder="blur"
              sizes="(max-width: 700px) 80vw, 460px"
              quality={IMAGE_QUALITY.photo}
            />
            <span className="vfinder" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
              <b className="vfinder__rec">REC</b>
              <span className="vfinder__clip">A001_C001</span>
            </span>
          </figure>
          <figure className="about__still" data-speed="-0.06">
            <Image src={still} alt="" placeholder="blur" sizes="(max-width: 700px) 42vw, 230px" quality={IMAGE_QUALITY.photo} />
          </figure>
        </div>

        <div className="about__copy" data-reveal style={{ "--d": "120ms" } as React.CSSProperties}>
          <Slate scene="01" label="The editor" />
          <h2 className="h2" id="about-title">
            The eye behind <em>the cut.</em>
          </h2>
          {paragraphs.map((p, i) => (
            <p key={i} className="lede">
              {p}
            </p>
          ))}
          <p className="about__sign">
            Ayush Nayak <span>/ ANX</span>
          </p>
          <div className="about__cta">
            <a href="#work" className="btn btn--cyan btn--lg">
              Watch the work <Arrow />
            </a>
            {settings.socials.instagram && (
              <a href={settings.socials.instagram} className="btn btn--ghost btn--lg" target="_blank" rel="noopener me">
                Instagram
              </a>
            )}
          </div>
        </div>
      </div>

      <p className="filmstrip__label wrap" aria-hidden="true">
        <i /> Off the timeline
      </p>
      <div className="filmstrip" role="group" aria-label="Off the timeline: photos of Ayush">
        <div className="filmstrip__run" data-drift="-0.1">
          {strip.map((frame, i) => (
            <figure key={i} className="filmstrip__frame" aria-hidden={i >= FRAMES.length || undefined}>
              <Image
                src={frame.src}
                alt={i < FRAMES.length ? frame.alt : ""}
                placeholder="blur"
                sizes="(max-width: 789px) 134px, (max-width: 1420px) 19vw, 254px"
                quality={IMAGE_QUALITY.photo}
              />
              <figcaption aria-hidden="true">
                <span>{frame.clip}</span>
                <span>{String((i % FRAMES.length) + 1).padStart(2, "0")}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
