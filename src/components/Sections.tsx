import Image from "next/image";
import Link from "next/link";
import avatar from "@/assets/ayush/ayush-nayak-avatar.webp";
import type { Brand, Category, Faq, PricingTier, Settings, Testimonial, Video } from "@/content/types";
import { manifesto, phoneLinks, services, site } from "@/content/site";
import { IMAGE_QUALITY } from "@/lib/images";
import { thumbnailUrl } from "@/lib/youtube";
import { BrandMark } from "./BrandMark";
import { ContactForm } from "./ContactForm";
import { Arrow, Eye, InstagramGlyph } from "./Icons";
import { Logo } from "./Logo";

export function Slate({ scene, label }: { scene: string; label: string }) {
  return (
    <p className="slate">
      <i /> Scene {scene} <span>/</span> {label}
    </p>
  );
}

export function BrandMarquee({ brands }: { brands: Brand[] }) {
  const row = brands.map((brand) => (
    <li key={brand.id}>
      <BrandMark brand={brand} large />
    </li>
  ));
  return (
    <section className="marquee" aria-label="Brands in the portfolio">
      <p className="marquee__label">Cut for</p>
      <div className="marquee__view">
        <ul className="marquee__run">{row}</ul>
        <ul className="marquee__run" aria-hidden="true">
          {row}
        </ul>
      </div>
    </section>
  );
}

export function Manifesto() {
  const words = manifesto.split(" ");
  return (
    <section className="manifesto" id="why" data-scrub="pin" data-clip="Hook">
      <div className="manifesto__stage">
        <p className="manifesto__text" style={{ "--n": words.length } as React.CSSProperties}>
          {words.map((word, i) => (
            <span key={i} style={{ "--i": i } as React.CSSProperties}>
              {word}{" "}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}


export function WorkIntro() {
  return (
    <header className="workintro wrap" data-reveal>
      <Slate scene="02" label="Work" />
      <h2 className="h2 h2--center">
        Short <em>Videos</em>
      </h2>
    </header>
  );
}

export function LongFormIntro() {
  return (
    <header className="longintro wrap" data-reveal>
      <Slate scene="03" label="Long form" />
      <h2 className="h2 h2--center">
        Long <em>Form</em>
      </h2>
      <p className="lede lede--center">
        Cinematic storytelling and long-form video content, showcasing narrative editing, pacing and cinematic visuals.
      </p>
    </header>
  );
}


export function MidCta() {
  return (
    <section className="midcta">
      <span className="midcta__ghost" data-drift="0.16" aria-hidden="true">
        Your brand next · Your brand next · Your brand next
      </span>
      <div className="midcta__inner wrap" data-reveal>
        <h2>Your footage could be doing this.</h2>
        <a href="#contact" className="btn btn--dark btn--lg">
          Start a project <Arrow />
        </a>
      </div>
    </section>
  );
}

export function Services({ videos, live }: { videos: Video[]; live: Category[] }) {
  return (
    <section className="section wrap" id="services" data-clip="Services" aria-labelledby="services-title">
      <header className="section__head" data-reveal>
        <Slate scene="04" label="Services" />
        <h2 className="h2" id="services-title">
          What I <em>cut</em>
        </h2>
      </header>
      <ol className="svc">
        {services.map((service, i) => {
          const video = videos.find((v) => v.id === service.thumbnailId);
          const href = live.some((c) => c.slug === service.categorySlug) ? `/work/${service.categorySlug}` : undefined;
          const body = (
            <>
              <span className="svc__num">{String(i + 1).padStart(2, "0")}</span>
              <span className="svc__title">{service.title}</span>
              <span className="svc__desc">{service.description}</span>
              {video && (
                <span className="svc__thumb" aria-hidden="true">
                  <Image src={thumbnailUrl(video)} alt="" fill sizes="128px" quality={IMAGE_QUALITY.content} />
                </span>
              )}
              {href && (
                <span className="svc__arrow" aria-hidden="true">
                  <Arrow />
                </span>
              )}
            </>
          );
          return (
            <li key={service.title} data-reveal>
              {href ? (
                <Link href={href} className="svc__row">
                  {body}
                </Link>
              ) : (
                <div className="svc__row">{body}</div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function Testimonials({
  videos,
  brandOf,
  testimonials,
}: {
  videos: Video[];
  brandOf: (id?: string) => Brand | undefined;
  testimonials: Testimonial[];
}) {
  const receipts = videos.filter((v) => v.views).slice(0, 4);
  if (!receipts.length && !testimonials.length) return null;
  return (
    <section className="section wrap" id="testimonial" data-clip="Proof" aria-labelledby="proof-title">
      <header className="section__head" data-reveal>
        <Slate scene="05" label="Testimonial" />
        <h2 className="h2" id="proof-title">
          The <em>receipts</em>
        </h2>
      </header>

      {receipts.length > 0 && (
      <ul className={`receipts receipts--${receipts.length}`}>
        {receipts.map((video, i) => {
          const brand = brandOf(video.brandId);
          return (
            <li key={video.id} className="receipt" data-reveal style={{ "--d": `${i * 70}ms` } as React.CSSProperties}>
              <span className="receipt__views" data-count>
                {video.views}
              </span>
              <span className="receipt__meta">
                <Eye size={14} /> views on {video.viewsSource}
                {/insta/i.test(video.viewsSource ?? "") && <InstagramGlyph size={14} />}
              </span>
              {brand && <BrandMark brand={brand} />}
            </li>
          );
        })}
      </ul>
      )}

      {testimonials.length > 0 && (
      <div className={`quotes quotes--${Math.min(testimonials.length, 3)}`}>
        {testimonials.map((t, i) => (
          <figure key={t.id} className="quote" data-reveal style={{ "--d": `${(i % 3) * 70}ms` } as React.CSSProperties}>
            <blockquote>{t.quote}</blockquote>
            <figcaption>
              <b>{t.author}</b>
              <span>{t.role}</span>
            </figcaption>
          </figure>
        ))}
      </div>
      )}
    </section>
  );
}

export function Pricing({ tiers }: { tiers: PricingTier[] }) {
  if (!tiers.length) return null;
  return (
    <section className="section wrap" id="pricing" data-clip="Pricing" aria-labelledby="pricing-title">
      <header className="section__head" data-reveal>
        <Slate scene="06" label="Pricing" />
        <h2 className="h2" id="pricing-title">
          Pick your <em>cut</em>
        </h2>
        <p className="lede">Every project is quoted on the brief, so you only pay for the edit you actually need.</p>
      </header>
      <div className="tiers">
        {tiers.map((tier, i) => (
          <article
            key={tier.id}
            className={`tier${tier.highlighted ? " tier--hot" : ""}`}
            data-reveal
            style={{ "--d": `${i * 70}ms` } as React.CSSProperties}
          >
            {tier.highlighted && <span className="tier__badge">{tier.badge || "Recommended"}</span>}
            <h3>{tier.name}</h3>
            <p className="tier__summary">{tier.summary}</p>
            <p className="tier__price">{tier.price}</p>
            <ul>
              {tier.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <a
              href="#contact"
              data-plan={tier.name}
              className={`btn btn--lg btn--block ${tier.highlighted ? "btn--cyan" : "btn--ghost"}`}
            >
              Get a quote <Arrow />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

export function FaqSection({ faqs, description }: { faqs: Faq[]; description: string }) {
  return (
    <section className="section wrap faq" id="faq" data-clip="FAQ" aria-labelledby="faq-title">
      <header className="section__head faq__head" data-reveal>
        <Slate scene="07" label="FAQ" />
        <h2 className="h2" id="faq-title">
          Quick <em>answers</em>
        </h2>
        <p className="lede">{description}</p>
      </header>
      <div className="faq__list">
        {faqs.map((faq, i) => (
          <details key={faq.question} name="faq" open={i === 0} data-reveal>
            <summary>
              <h3>{faq.question}</h3>
              <i aria-hidden="true" />
            </summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function Contact({
  categories,
  pricing,
  settings,
}: {
  categories: Category[];
  pricing: PricingTier[];
  settings: Settings;
}) {
  const social = settings.socials.instagram
    ? { label: "Instagram", href: settings.socials.instagram }
    : settings.socials.youtube
      ? { label: "YouTube", href: settings.socials.youtube }
      : null;
  const phone = phoneLinks(settings.phone);
  return (
    <section className="contact" id="contact" data-clip="Hire" aria-labelledby="contact-title">
      <div className="wrap contact__grid">
        <header data-reveal>
          <Slate scene="08" label="Final cut" />
          <h2 className="contact__title" id="contact-title">
            Let&rsquo;s make them <em>stop scrolling.</em>
          </h2>
          <p className="lede">Send the footage, the idea or just the deadline. I&rsquo;ll tell you what the edit should be.</p>
          <div className="contact__me">
            <span className="contact__avatar">
              <Image src={avatar} alt="" fill sizes="56px" quality={IMAGE_QUALITY.photo} />
            </span>
            <p>
              <b>Ayush Nayak</b>
              <span>Every brief comes straight to me.</span>
            </p>
          </div>
          {(settings.email || phone || social) && (
            <p className="contact__links">
              {settings.email && (
                <a className="textlink" href={`mailto:${settings.email}`}>
                  {settings.email}
                </a>
              )}
              {phone && (
                <a className="textlink" href={phone.tel}>
                  {phone.display}
                </a>
              )}
              {phone && (
                <a className="textlink" href={phone.whatsapp} target="_blank" rel="noopener">
                  WhatsApp <Arrow />
                </a>
              )}
              {social && (
                <a className="textlink" href={social.href} target="_blank" rel="noopener me">
                  ANX on {social.label} <Arrow />
                </a>
              )}
            </p>
          )}
        </header>
        <div data-reveal>
          <ContactForm
            email={settings.email}
            projectTypes={categories.map((c) => c.label)}
            plans={pricing.map((p) => p.name)}
            fallback={social}
          />
        </div>
      </div>
    </section>
  );
}

export function Footer({
  categories,
  meta,
  base = "",
}: {
  categories: Category[];
  meta: { settings: Settings; links: { key: string; label: string; href: string }[] };
  base?: string;
}) {
  const phone = phoneLinks(meta.settings.phone);
  return (
    <footer className="footer">
      <div className="footer__mark" aria-hidden="true">
        <Logo />
      </div>
      <div className="wrap footer__grid">
        <div>
          <p className="footer__blurb">
            {site.person} is a video editor working as ANX.
            {meta.settings.totalViews && ` ${meta.settings.totalViews} views across Instagram.`}
            {meta.settings.city && ` Based in ${meta.settings.city}.`}
          </p>
          {meta.settings.email && (
            <a className="textlink footer__mail" href={`mailto:${meta.settings.email}`}>
              {meta.settings.email}
            </a>
          )}
          {phone && (
            <p className="footer__phone">
              <a className="textlink" href={phone.tel}>
                {phone.display}
              </a>
              <a className="textlink" href={phone.whatsapp} target="_blank" rel="noopener">
                WhatsApp
              </a>
            </p>
          )}
        </div>
        <nav aria-label="Genres">
          <p className="footer__h">Work</p>
          {categories.map((c) => (
            <Link key={c.slug} href={`/work/${c.slug}`}>
              {c.label}
            </Link>
          ))}
        </nav>
        <nav aria-label="Site">
          <p className="footer__h">Site</p>
          <Link href={`${base}#services`}>Services</Link>
          <Link href={`${base}#pricing`}>Pricing</Link>
          <Link href={`${base}#faq`}>FAQ</Link>
          <Link href={`${base}#contact`}>Hire me</Link>
          {meta.links.map((link) => (
            <a key={link.key} href={link.href} target="_blank" rel="noopener me">
              {link.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="footer__legal wrap">
        <p>
          © {new Date().getFullYear()} {site.person}. Brand names and logos belong to their owners.
        </p>
        <a className="credit" href="https://www.codehyphen.in" target="_blank" rel="noopener">
          <span className="credit__label">Designed &amp; built by</span>
          {/* eslint-disable-next-line @next/next/no-img-element -- tiny static logo */}
          <img className="credit__logo" src="/brands/code-hyphen.webp" alt="Code Hyphen" width={70} height={24} loading="lazy" />
          <span className="credit__arrow" aria-hidden="true">
            <Arrow />
          </span>
        </a>
      </div>
    </footer>
  );
}
