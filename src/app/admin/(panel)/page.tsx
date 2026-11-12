import Link from "next/link";
import { PageHead } from "@/components/admin/Fields";
import { site } from "@/content/site";
import { getFreshContent, isLive } from "@/lib/content";
import { mailConfigured } from "@/lib/server/mail";
import { store } from "@/lib/store";

export const metadata = { title: "Overview" };

export default async function Overview() {
  const [content, briefs] = await Promise.all([getFreshContent(), store.listBriefs().catch(() => [])]);
  const { settings, videos, categories, brands, testimonials } = content;
  const live = categories.filter((c) => isLive(c, videos));
  const published = testimonials.filter((t) => !t.placeholder);
  const unread = briefs.filter((b) => !b.read);

  const checklist = [
    { done: Boolean(settings.email), label: "Contact email (public, and where briefs are sent)", href: "/admin/settings" },
    { done: mailConfigured(), label: "Email delivery (RESEND_API_KEY on the host)", href: "/admin/settings" },
    { done: Boolean(settings.socials.instagram), label: "Instagram link", href: "/admin/settings" },
    { done: published.length > 0, label: "At least one real testimonial", href: "/admin/testimonials" },
    {
      done: brands.every((b) => b.logo),
      label: `Brand logos (${brands.filter((b) => !b.logo).length} still shown as text)`,
      href: "/admin/brands",
    },
    {
      done: videos.filter((v) => v.views).length >= 4,
      label: `View counts (${videos.filter((v) => v.views).length} of ${videos.length} videos have one)`,
      href: "/admin/videos",
    },
  ];

  return (
    <>
      <PageHead title="Overview">
        <span className="a-muted">
          {content.updatedAt ? `Last saved ${new Date(content.updatedAt).toLocaleString("en-IN")}` : "Showing the built-in content"}
        </span>
      </PageHead>

      <section className="a-stats">
        <Link href="/admin/videos" className="a-stat">
          <b>{videos.length}</b>
          <span>videos</span>
        </Link>
        <Link href="/admin/genres" className="a-stat">
          <b>{live.length}</b>
          <span>live genres</span>
        </Link>
        <Link href="/admin/brands" className="a-stat">
          <b>{brands.length}</b>
          <span>brands</span>
        </Link>
        <Link href="/admin/inbox" className="a-stat">
          <b>{unread.length}</b>
          <span>unread briefs</span>
        </Link>
      </section>

      <div className="a-grid2">
        <section className="a-card">
          <h2>Before launch</h2>
          <ul className="a-checklist">
            {checklist.map((item) => (
              <li key={item.label} className={item.done ? "is-done" : undefined}>
                <i aria-hidden="true">{item.done ? "✓" : ""}</i>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="a-card">
          <h2>Latest briefs</h2>
          {briefs.length === 0 ? (
            <p className="a-muted">No briefs yet. They appear here when someone sends the contact form.</p>
          ) : (
            <ul className="a-mini">
              {briefs.slice(0, 5).map((b) => (
                <li key={b.id}>
                  <Link href={`/admin/inbox#${b.id}`}>
                    <b>{b.brand || b.name}</b>
                    <span>
                      {b.type} · {new Date(b.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </Link>
                  {!b.read && <i className="a-dot" aria-label="Unread" />}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
