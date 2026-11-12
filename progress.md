# ANX Portfolio: Progress

Last updated: 2026-11-10

Portfolio for Ayush Nayak (ANX), video editor. Source brief: `Portfolio Structure.pdf`.

## Resume here

```bash
cd /home/chanchal/Desktop/Clients/ANXfolio
npm run dev        # http://localhost:3000, admin at /admin
```

The local admin password is in `.env.local` (`ADMIN_PASSWORD`). That file is git-ignored.

**Status:** frontend and admin backend built and tested. Ready to deploy. The remaining items are content Ayush can now fill in himself from the admin.

**Next step:** deploy (see "Deploy" in `README.md`), then hand Ayush the admin URL and password.

Nothing is committed. The folder is not a git repository yet. No server is left running.

## Done

- Next.js (App Router) and TypeScript, production build passing with no warnings
- Home page: hero fly-through, brand strip, manifesto, the editor (with numbers), short-form genres in one tabbed section, long form, services, view-count receipts, testimonials, pricing, FAQ, contact form, footer
- Timeline dock, genre pages at `/work/[slug]`, SEO, AEO and GEO (JSON-LD, video sitemap, `/llms.txt`, share image)
- **Admin at `/admin`** (2026-11-09): videos (add by YouTube link with automatic title, date and thumbnail check), genres, brands with logo upload, testimonials, pricing, settings, inbox, backup and restore
- **Contact form** saves each brief to the admin inbox and emails it when Resend is configured. Validation, spam traps and rate limiting included
- **Storage:** JSON files in `.data/` by default, Upstash Redis when its variables are set (needed on Vercel)
- Pages refresh straight after each admin save. No rebuild needed
- Draft testimonials are hidden on the site (the old on-screen "Placeholder" labels are gone)
- Responsive fixes: no horizontal scroll at 320 to 1920px, on the site and in the admin
- Hero performance: about 6fps gained on weak GPUs from rounding the image corners instead of clipping the tiles
- **"The editor" section** (2026-11-09): studio portrait in a camera viewfinder, the ANX.PRODUCTION still overlapping it, a bio Ayush can edit in Settings, and an "Off the timeline" filmstrip of five candid photos that drifts with the scroll. "About" added to the nav and the timeline dock
- Contact section shows a small avatar ("Every brief comes straight to me"). The Person schema now has his photo
- Footer credit: "Designed & built by Code Hyphen", linking to codehyphen.in. The same logo now fills the Code Hyphen client logo in the brand strip
- Image quality pass (2026-11-09): WebP quality raised from 55/70 to 85 (thumbnails) and 90 (photos), photo masters rebuilt near-lossless, wrong `sizes` fixed on the hero wall, avatar and filmstrip, images decoded ahead of the viewport
- Original photos moved from `public/` to `photos-original/` (23 MB, including one with an ID badge), so they are not published. Web crops are in `src/assets/ayush/`

- **Brief revision** (2026-11-10, new `Portfolio Structure.pdf`):
  - Colour Grading is live with 5 videos
  - Fashion Films 01 is now `7z1UyOleNJ0`, the Miss Universe India finalist film
  - Unicorn Store logo added from unicornstore.in
  - View counts show an eye icon and an Instagram glyph
  - A one-off migration in `src/lib/content.ts` applies these changes to content already saved in the admin
- **Layout pass** (2026-11-10):
  - The "Off the timeline" filmstrip is removed
  - The numbers row is merged into the About section
  - The six short-form reels are now one tabbed section, with UGC shown as a "Soon" chip
  - The footer ANX is a faded watermark behind the footer
  - The page went from 22.4 to 15.3 screens at 1366×768, even with Colour Grading added
- **Photos** (2026-11-10):
  - New portrait cropped to the face from `photos-original/AyushNayak.png`. It replaces `1779987388694.png`
  - The portrait and the ANX still swap places when the small one is dragged onto the big one or tapped
  - All photos are now WebP files named `ayush-nayak-*.webp`, and the contact section has its own avatar crop

## Test results (2026-11-09)

| Check | Result |
| --- | --- |
| End-to-end (contact form, login, inbox, add/edit/remove video, settings, testimonials, logo upload, genre guard, backup) | 27 of 27 passing |
| Overflow and console errors, 9 widths × 12 pages | None, in Chrome and WebKit (Safari's engine) |
| Public interactions (menu, FAQ, play, sliders, carousel, dock) | Passing in Chrome and WebKit |
| Layout shift | 0 to 0.03 |
| Scrolling, Intel HD 520 GPU, 1440×900 | 57 to 60fps on most sections, hero 44 to 60fps, new editor section 54fps |
| Scrolling, phone emulation with 4× CPU slowdown | 41 to 57fps, no frames over 34ms |
| JavaScript | 192 KB gzipped, mostly the React and Next.js runtime |
| Images | All WebP (plus 3 SVG logos). Thumbnails q85, photos q90 (measured visually lossless). First screen 0.4 MB on iPhone, 1.0 MB on a retina desktop |
| Full-page scroll, Intel HD 520 GPU | 58 to 60fps, 95% of frames under 17ms, LCP 0.5 to 0.8s |

WebKit was tested in Playwright, not on an actual iPhone. A real-device check is still worth doing after deploy.

## To do

### For you (deploy)

- [ ] Deploy. Vercel with Upstash Redis is simplest. See `README.md`
- [ ] Set `ADMIN_PASSWORD`, and optionally `RESEND_API_KEY` and `MAIL_FROM` on the host
- [ ] If you edited content locally, move it with Admin → Settings → Download backup, then Restore on the live site
- [ ] Open the site on a real iPhone and Android phone
- [ ] Initialise git when ready. `.gitignore` already excludes `.env*`, `.data/`, `CLAUDE.md` and `.claude/`

### For Ayush (all in the admin, no code)

The admin Overview page shows this as a checklist.

- [ ] Inbox email (Settings)
- [ ] Instagram link and city (Settings)
- [ ] Real testimonials (Testimonials)
- [ ] Logos for Smirnoff, Black & White and HAPUSA (Brands). These brands don't publish a logo file, so they still show as text
- [ ] Check the bio under Settings → About you. It is a draft written from the brief
- [ ] View counts for the other videos (Videos)
- [ ] Better titles for the generic "Fashion film edit 01" style videos (Videos)
- [ ] Prices, if he wants them shown (Pricing)
- [ ] UGC videos, then set that genre live (Videos, Genres)

## Open questions

- **Behance reference:** gallery 250419513 blocks automated access, so the design follows the PDF mockups only
- **Long-form attribution:** the first long-form video is on the Dr. Ipsa Shah channel. Confirm it is fine to show as Ayush's edit
- **ANX logo:** still my redraw from the mockup (`src/components/logo-path.ts`). Replace it if an original vector exists

## Things to keep in mind

- **Copy:** Ayush's pronouns are unknown, so site copy uses first person or repeats the name. Do not invent client facts, quotes or view counts
- **Performance:** keep the rules in `README.md`. Each one was measured
- **Rate limits** are in memory per server instance. Restarting the server resets them
- **Stopping a test server:** use `fuser -k <port>/tcp`

## Where things are

| What | Where |
| --- | --- |
| Admin pages | `src/app/admin/` |
| Admin saves (server actions) | `src/app/admin/actions.ts` |
| Contact form handler | `src/app/actions/brief.ts` |
| Storage (file and Redis) | `src/lib/store/` |
| Login, mail, rate limit, YouTube lookup | `src/lib/server/` |
| Content reads | `src/lib/content.ts` |
| Starting content | `src/content/` |
| Scroll effects | `src/components/MotionEngine.tsx` |
| Styles | `src/app/globals.css`, `src/app/admin/admin.css` |
