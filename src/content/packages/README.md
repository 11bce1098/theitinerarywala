# Packages

Bookable holiday packages. One markdown file per package; the filename is
the URL, so `georgia-tbilisi-kazbegi-4n-5d.md` serves at
`/packages/georgia-tbilisi-kazbegi-4n-5d/`.

This file is excluded from the collection by the loader, so it is
documentation rather than a package.

## Frontmatter

```yaml
title: "Tbilisi and Kazbegi — 4 nights, 5 days"
country: "Georgia"        # must exist in src/lib/geography.mjs
nights: 4
days: 5
route: "Tbilisi → Kazbegi → Mtskheta"   # optional, shown on cards
summary: "One or two sentences. Used on the card and as the meta description."
heroImage: "/images/packages/kazbegi.jpeg"       # card crop, 2:1 or narrower
heroWide: "/images/packages/kazbegi-wide.jpeg"   # hero band, wider than 2:1
publishDate: 2026-10-02
```

`check-content.mjs` enforces the hero aspect ratios and every root-relative
link, and fails the build rather than shipping a broken one.

## Pricing — not set yet

Three fields are optional and currently unset on all four Georgia packages:

```yaml
priceFrom: 549           # per person, twin share
priceCurrency: "USD"     # defaults to USD
inclusions:
  - "3 nights in a 3-star hotel, breakfast included"
  - "Airport transfers both ways"
exclusions:
  - "International flights"
  - "Travel insurance"
```

With `priceFrom` unset the page shows **Price on request** and an enquiry
button. That is deliberate, not a placeholder to be filled with a guess: a
number on a page that reads as bookable is a quote, and a wrong one is worse
than none. Add the fields once a rate is actually agreed with the operator.

Adding `priceFrom` also switches on the `Offer` block in the page's
structured data — Google rejects an `Offer` with no price, which is why it
is omitted rather than marked up as "on request".

## Body

Markdown. The convention the Georgia four use:

- An opening paragraph or two on what this length gets you.
- `## Day by day`, then `### Day 1 — Arrival` and so on.
- `## Good to know` for the caveats worth saying before someone books —
  road closures, long driving days, anything seasonal.

Do not restate the price in the body; the sidebar panel already says it, and
having both means two places to update.
