# The Itinerary Wala

Static itinerary site built with [Astro](https://astro.build). Each itinerary
is one markdown file — no database, no admin panel, nothing to maintain.

## Run locally

```bash
npm install
npm run dev        # http://localhost:4321
```

## Add a new itinerary

1. Copy `src/content/itineraries/georgia-7-day-family.md`
2. Rename it (the filename becomes the URL: `japan-10-day-family.md` → `/itineraries/japan-10-day-family/`)
3. Edit the frontmatter (title, days, budget, visaNote, etc.) and the day sections
4. Commit and push — Cloudflare rebuilds the site automatically

### Affiliate buttons

Inside any itinerary, drop a button wherever a booking makes sense:

```html
<a class="book-btn" href="YOUR-AFFILIATE-LINK">Book a hotel in Old Town</a>
```

Replace every `#PASTE-...` placeholder with real links from your
Travelpayouts / Viator dashboards before publishing.

## Deploy to Cloudflare Pages (one-time setup)

1. Push this folder to a GitHub repository
2. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**
3. Pick the repo. Cloudflare detects Astro automatically; if asked:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Deploy. You get a `*.pages.dev` URL immediately.
5. **Custom domain:** in the Pages project → Custom domains → add
   `theitinerarywala.com`, then follow the DNS instructions
   (at GoDaddy you'll either change nameservers to Cloudflare or add a
   CNAME — Cloudflare shows the exact records).

After setup, publishing = `git push`. Nothing else.

## Before going live

- Set your real domain in `astro.config.mjs` (`site: ...`)
- Replace the Instagram link in `src/layouts/Base.astro` if the handle changes
- Swap placeholder affiliate links for real ones

## Cover images

Every itinerary gets a cover on the homepage card and behind the page hero.
They resolve in this order:

1. **A real photo** — set `heroImage` in the itinerary's frontmatter.
2. **A country illustration** — a flat travel-poster scene of that country's
   landmark, defined in `src/components/scenes.ts` and matched on the
   `country` field (case-insensitive).
3. **A seeded fallback** — generic ridge lines, so a country with no scene
   yet is never a blank box.

### Dropping in a real (or AI-generated) photo

Save the file under `public/images/` (lowercase names — production serves
from Linux, where `Georgia.jpeg` and `georgia.jpeg` are different files),
then point at it from frontmatter:

```yaml
heroImage: "/images/georgia.jpeg"       # cards + phone hero — 1600x1000 (16:10)
heroWide:  "/images/georgia-wide.jpg"   # desktop hero band — 2600x1000 (2.6:1)
heroFocus: "center 35%"                 # optional: nudge the crop
```

**Two sizes, because the two slots are different shapes.** The card is a
fixed 16:10 box, but the desktop hero band is a wide strip whose ratio runs
from about 1.8:1 at 1024px up to 2.8:1 on a wide monitor. Dropping one 16:10
image into both means the hero crops away a third of its height and slices
whatever is near the top — so give it its own wide crop:

| Field       | Size        | Used for                          |
| ----------- | ----------- | --------------------------------- |
| `heroImage` | 1600 × 1000 | homepage cards, and phone heroes  |
| `heroWide`  | 2600 × 1000 | desktop hero band (≥ 761px)       |

`heroWide` is optional — leave it out and the hero falls back to
`heroImage`, cropped. `heroFocus` takes any CSS `object-position`
(`"center 35%"` keeps more sky, `"center 70%"` keeps more foreground) and
only affects `heroImage`.

Prompts should say **"no text, no lettering, no logos"** — the page already
supplies the title, country, dates and pills, so text baked into the image
only competes with it. Keep the subject near the middle; both slots crop
outward from the centre.

### Adding a new country illustration

Add an entry to `scenes.ts` keyed by the lowercase country name. Scenes are
drawn on a `400×250` viewBox with flat fills only — no gradients or `id`s
inside a scene body, so the same scene can safely appear twice on one page.
`--depth` on a layer drives the hover parallax (higher numbers sit further
back).

## Pages

| Path                    | Source                                  |
| ----------------------- | --------------------------------------- |
| `/`                     | `src/pages/index.astro`                 |
| `/about/`               | `src/pages/about.astro`                 |
| `/contact/`             | `src/pages/contact.astro`               |
| `/itineraries/<slug>/`  | `src/pages/itineraries/[...slug].astro` |

Header and footer live in `src/components/SiteHeader.astro` and
`SiteFooter.astro`. Both read their links from `src/lib/site.ts` — add a nav
item there and it appears in the desktop nav, the mobile menu and the footer
at once. The footer's Destinations column is generated from the itinerary
collection, so it can't go stale.

## Contact and newsletter forms

The site is statically generated, so the forms need somewhere to POST.

**Out of the box** (no configuration): both forms validate in the browser and
then open the visitor's email client pre-filled. Nothing is silently dropped,
but it's not a great experience.

**Recommended**: sign up for a form service and set one environment variable.

```bash
cp .env.example .env
# then edit .env:
PUBLIC_FORM_ENDPOINT=https://formspree.io/f/xxxxxxxx
```

Add the same variable in the Cloudflare Pages dashboard under
**Settings → Environment variables** so it applies to the deployed site. The
`PUBLIC_` prefix is required — Astro only exposes prefixed variables to the
browser.

With an endpoint set, submissions go over `fetch` and the visitor gets an
inline success message without leaving the page. The contact form also has a
honeypot field that silently discards bot submissions.

**Before launch**, replace the placeholder email and social handle in
`src/lib/site.ts`, and rewrite the three "How each itinerary gets built"
steps in `src/pages/about.astro` in your own words — they are the most
credible thing on that page.
