# ANX Portfolio: Progress

Last updated: 2026-11-09

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
- Home page: hero fly-through, brand strip, manifesto, numbers, short-form reels, long-form intermission, services, view-count receipts, testimonials, pricing, FAQ, contact form, footer
- Timeline dock, genre pages at `/work/[slug]`, SEO, AEO and GEO (JSON-LD, video sitemap, `/llms.txt`, share image)
- **Admin at `/admin`** (2026-11-09): videos (add by YouTube link with automatic title, date and thumbnail check), genres, brands with logo upload, testimonials, pricing, settings, inbox, backup and restore
- **Contact form** saves each brief to the admin inbox and emails it when Resend is configured. Validation, spam traps and rate limiting included
- **Storage:** JSON files in `.data/` by default, Upstash Redis when its variables are set (needed on Vercel)
- Pages refresh straight after each admin save. No rebuild needed
- Draft testimonials are hidden on the site (the old on-screen "Placeholder" labels are gone)
- Responsive fixes: no horizontal scroll at 320 to 1920px, on the site and in the admin
- Hero performance: about 6fps gained on weak GPUs from rounding the image corners instead of clipping the tiles

## Test results (2026-11-09)

| Check | Result |
| --- | --- |
| End-to-end (contact form, login, inbox, add/edit/remove video, settings, testimonials, logo upload, genre guard, backup) | 27 of 27 passing |
| Overflow and console errors, 9 widths × 12 pages | None, in Chrome and WebKit (Safari's engine) |
| Public interactions (menu, FAQ, play, sliders, carousel, dock) | Passing in Chrome and WebKit |
| Layout shift | 0 to 0.03 |
| Scrolling, Intel HD 520 GPU, 1440×900 | 57 to 60fps on most sections, hero 44 to 56fps |
| Scrolling, phone emulation with 4× CPU slowdown | 41 to 57fps, no frames over 34ms |
| JavaScript | 192 KB gzipped, mostly the React and Next.js runtime |

WebKit was tested in Playwright, not on an actual iPhone. A real-device check is still worth doing after deploy.

## To do

### For you (deploy)

- [ ] Deploy. Vercel with Upstash Redis is simplest. See `README.md`
- [ ] Set `NEXT_PUBLIC_SITE_URL`, `ADMIN_PASSWORD`, and optionally `RESEND_API_KEY` and `MAIL_FROM` on the host
- [ ] If you edited content locally, move it with Admin → Settings → Download backup, then Restore on the live site
- [ ] Open the site on a real iPhone and Android phone
- [ ] Initialise git when ready. `.gitignore` already excludes `.env*`, `.data/`, `CLAUDE.md` and `.claude/`

### For Ayush (all in the admin, no code)

The admin Overview page shows this as a checklist.

- [ ] Inbox email (Settings)
- [ ] Instagram link and city (Settings)
- [ ] Real testimonials (Testimonials)
- [ ] Logos for Smirnoff, Black & White, HAPUSA, Unicorn Store and Code Hyphen (Brands)
- [ ] View counts for the other videos (Videos)
- [ ] Better titles for the generic "Fashion film edit 01" style videos (Videos)
- [ ] Prices, if he wants them shown (Pricing)
- [ ] Colour Grading and UGC videos, then set those genres live (Videos, Genres)

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
