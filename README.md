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
