# ANX Portfolio

Portfolio site for Ayush Nayak (ANX), video editor. Built with Next.js (App Router) and TypeScript.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start   # production
```

Copy `.env.example` to `.env.local`. Locally only `ADMIN_PASSWORD` is needed. Then open http://localhost:3000/admin.

## Admin

Ayush manages the site at `/admin` (not linked anywhere, hidden from search engines). Set `ADMIN_PASSWORD` first.

| Page | What it does |
| --- | --- |
| Overview | Counts, a "before launch" checklist, latest briefs |
| Videos | Paste a YouTube link to add a video. Title, upload date and a working thumbnail are fetched from YouTube. Edit title, genre, brand, view count, hero-wall spot. Reorder and remove |
| Genres | Rename, edit SEO text, set live or "In the edit", reorder, add new genres |
| Brands | Names, logo upload (SVG or PNG, under 300 KB), order of the "Cut for" strip |
| Testimonials | Add real quotes. Drafts never appear on the site. With none published, only the view-count receipts show |
| Pricing | Plans, prices, features, highlighted plan |
| Inbox | Briefs sent through the contact form. Reply, mark read, delete |
| Settings | Inbox email, headline numbers, city, Instagram and other profiles, backup download and restore |

Every save refreshes the public pages straight away. Nothing needs a rebuild.

The files in `src/content/` are now the starting content only. Once the admin saves, the stored copy is used instead.

## Environment variables

All are listed in `.env.example`.

| Variable | Needed for |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs, sitemap, share cards, JSON-LD |
| `ADMIN_PASSWORD` | The admin. Without it, `/admin` stays switched off. Changing it signs everyone out |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Storage on Vercel or any serverless host. The Vercel Upstash integration's `KV_REST_API_URL` and `KV_REST_API_TOKEN` also work |
| `RESEND_API_KEY`, `MAIL_FROM` | Optional. Emails each brief to the inbox email. Without it, briefs are still saved to the admin inbox |
| `ANX_DATA_DIR` | Optional. Where file storage lives. Default `./.data` |

## Storage

- **No Redis variables:** content, briefs and logos are JSON files in `.data/`. Use this locally and on any Node host with a persistent disk (VPS, Railway or Render with a volume). Back up that folder.
- **Redis variables set:** everything is stored in Upstash Redis. Use this on Vercel, where the disk is read-only. The admin shows a warning if it runs on Vercel without Redis.

## Deploy

**Vercel (recommended):** import the project, add Upstash Redis from the Vercel Marketplace (free tier), then set `NEXT_PUBLIC_SITE_URL`, `ADMIN_PASSWORD` and optionally `RESEND_API_KEY` and `MAIL_FROM`. Redeploy.

**Any Node host:** `npm ci && npm run build && npm start` with the same variables. Keep `.data/` on a persistent disk.

**Moving content from your computer to the live site:** Admin → Settings → Download backup locally, then Restore on the live admin.

## Photos

Near-lossless crops of Ayush's photos live in `src/assets/ayush/` and are imported by `src/components/About.tsx` (portrait, still and filmstrip) and the contact section. Next.js serves them as resized WebP with a blur placeholder. The full-size originals are in `photos-original/`, outside `public/`, so they are never published. Crop new ones from there.

The footer credit links to Code Hyphen (`public/brands/code-hyphen.webp`).

## Edit content in code

| What | Where |
| --- | --- |
| Starting videos, brands, genres | `src/content/videos.ts` |
| Fixed copy: manifesto, services, FAQ wording | `src/content/site.ts` |
| Starting settings, testimonials, pricing | `src/content/site.ts` |

`parseYouTubeId` in `src/lib/youtube.ts` extracts the ID from any YouTube URL.

All pages read content through `src/lib/content.ts`.

## Page structure (AIDA)

| Stage | Sections |
| --- | --- |
| Attention | Hero fly-through, brand strip |
| Interest | Manifesto, numbers, short-form reels, long-form intermission |
| Desire | Services, view-count receipts, testimonials |
| Action | Pricing, FAQ, brief form |

## Performance rules

These keep scrolling smooth. Each one was measured, so please keep them when changing the site.

- Scroll effects run from one loop in `MotionEngine.tsx` and write only transforms and CSS variables.
- Never read layout (`offsetLeft`, `scrollHeight`, `getBoundingClientRect`) inside a scroll callback. Measure once and cache, as `TimelineDock.tsx` does.
- Layout must not depend on how much HTML has streamed in. The hero wall uses fixed grid tracks because `flex: 1` columns caused large layout shifts.
- YouTube iframes are created only on click (`VideoFacade.tsx`).
- Grid columns use `minmax(0, 1fr)`, never bare `1fr`. A long title or logo otherwise widens the column past the screen.
- Hero wall tiles round the image itself instead of clipping the tile. Clipping cost about 6fps on Intel HD 520.
- Images: every photo and thumbnail is served as WebP through `next/image`. Quality is set once in `src/lib/images.ts` (85 for thumbnails, 90 for Ayush's photos, 50 only behind heavy blur), picked by measuring SSIM at served sizes. WebP is used over AVIF because it decodes faster on low-end phones.
- Every `sizes` value matches the rendered width. Too small looks soft, too large wastes data.
- Photo masters in `src/assets/ayush/` are near-lossless (JPEG q95, 4:4:4) so served images are compressed only once.
- `MotionEngine` decodes images a screen ahead of the viewport, so first-time decoding does not drop frames.

## SEO, AEO and GEO

- Static HTML with metadata, canonical URLs and a generated Open Graph image
- JSON-LD: `WebSite`, `Person`, `ProfessionalService`, `FAQPage`, `VideoObject`, `BreadcrumbList`
- `sitemap.xml` with video entries, and `robots.txt` that explicitly allows AI crawlers
- `/llms.txt`, generated from the site content
- A landing page per genre at `/work/[slug]`
- Draft testimonials are hidden on the site and excluded from structured data
- `/admin` and `/media/` are disallowed in `robots.txt`, and admin pages are `noindex`

## Security

- The admin session is a signed, HttpOnly cookie scoped to `/admin`. Every admin page and every save checks it on the server.
- Login is rate limited (8 tries per 15 minutes per address). The contact form allows 5 briefs per 10 minutes and has two spam traps.
- Uploaded logos are served with `Content-Security-Policy: default-src 'none'`, so scripts inside an SVG can never run.
