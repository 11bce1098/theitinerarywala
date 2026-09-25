Guides go here as `.md` files, one question per file.

```yaml
---
title: "Japan visa requirements, by passport"
country: "Japan"          # optional — omit for cross-country pieces
topic: "visa"             # visa | when-to-go | transport | money | practical
summary: "One or two sentences. Shown on cards and as the meta description."
heroImage: "/images/japan.jpeg"   # optional
publishDate: 2026-09-26
draft: false
---

Body in markdown. `## Headings` become the page's sections.
```

`country` must match a name in `src/lib/geography.mjs`, or the build fails
loudly — the same guard the itineraries get.

The Guides nav item and the /guides/ page only appear once at least one
non-draft guide exists, so this folder can sit empty without leaving a dead
link on every page.
