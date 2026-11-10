import still from "@/assets/ayush/ayush-nayak-anx-production.webp";
import portrait from "@/assets/ayush/ayush-nayak-video-editor.webp";
import type { Settings } from "@/content/types";
import { Arrow } from "./Icons";
import { PhotoSwap } from "./PhotoSwap";
import { Slate } from "./Sections";

/** The person behind the edits: swappable photos, a bio and the headline numbers. */
export function About({
  settings,
  videoCount,
  genreCount,
}: {
  settings: Settings;
  videoCount: number;
  genreCount: number;
}) {
  const paragraphs = settings.about.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const stats = [
    { value: settings.totalViews, label: "views across Instagram" },
    { value: settings.topVideoViews, label: settings.topVideoLabel },
    { value: String(videoCount), label: "edits in this portfolio" },
    { value: String(genreCount), label: "genres and counting" },
  ].filter((item) => item.value && item.label);

  return (
    <section className="about" id="about" data-clip="Editor" aria-labelledby="about-title">
      <div className="wrap about__grid">
        <div className="about__media" data-reveal>
          <PhotoSwap
            photos={[
              { src: portrait, alt: "Ayush Nayak, video editor and colourist behind ANX", position: "50% 30%" },
              { src: still, alt: "Ayush Nayak on an ANX Production poster" },
            ]}
          />
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

          {stats.length > 0 && (
            <dl className="stats__grid" aria-label="Portfolio numbers">
              {stats.map((item) => (
                <div key={item.label} className="stats__item">
                  <dt>{item.label}</dt>
                  <dd data-count>{item.value}</dd>
                </div>
              ))}
            </dl>
          )}

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
    </section>
  );
}
