import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const itineraries = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/itineraries' }),
  schema: z.object({
    title: z.string(),
    country: z.string(),
    days: z.number(),
    // Author the figure in whatever currency you researched in; the site
    // converts it to USD and to the destination currency at live rates.
    budgetAmount: z.number().optional(),
    budgetCurrency: z.string().default('USD'),
    // Optional, and only for something true of every passport (e.g. "e-visa
    // online, no embassy visit"). Anything nationality-specific belongs in
    // the body, not here — the pill is read by everyone.
    visaNote: z.string().optional(),
    bestFor: z.string(),
    /**
     * Travel styles this trip suits, for /styles/<slug>/. Editorial judgement,
     * so it lives here — the budget style is derived from cost instead, in
     * src/lib/styles.mjs, and must not be listed.
     */
    styles: z
      .array(z.enum(['beach', 'nature', 'culture', 'couples', 'family', 'multi-country']))
      .default([]),
    // "Tashkent → Samarkand → Bukhara → Khiva" — shown on cards so someone
    // scrolling knows the shape of the trip without opening it.
    route: z.string().optional(),
    summary: z.string(),         // one or two sentences for cards + meta description
    heroImage: z.string().optional(), // path under /public, e.g. /images/georgia.jpg
    // Wide crop for the itinerary hero band (~2.6:1). Falls back to heroImage.
    heroWide: z.string().optional(),
    // CSS object-position for the hero crop, e.g. "center 35%" to keep the sky.
    heroFocus: z.string().optional(),
    publishDate: z.coerce.date(),
    // Set when an itinerary is revised; the page falls back to publishDate.
    updatedDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

/**
 * Practical guides — the questions that sit around an itinerary rather than
 * inside one: visas, when to go, how to get about, what things cost.
 *
 * Deliberately a separate collection from itineraries. An itinerary is a
 * route with days and a budget; a guide answers one question about a place.
 * Mixing them would have made both schemas mostly-optional and both listing
 * pages incoherent.
 */
const guides = defineCollection({
  // The README documents the frontmatter for whoever adds a guide next;
  // it is not one itself.
  loader: glob({ pattern: ['**/*.md', '!README.md'], base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    /** Country it concerns, matching geography.mjs. Omit for cross-country pieces. */
    country: z.string().optional(),
    /** What kind of question this answers; drives the listing and the badge. */
    topic: z.enum(['visa', 'when-to-go', 'transport', 'money', 'practical']),
    summary: z.string(),
    heroImage: z.string().optional(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

/**
 * Bookable holiday packages — a fixed run of nights with transfers, tours and
 * accommodation, sold rather than merely described.
 *
 * Separate from itineraries on purpose, and the distinction is commercial
 * rather than editorial. An itinerary is free advice: it carries a researched
 * budget the reader spends themselves, and nobody is on the hook if they
 * choose differently. A package is an offer — a fixed duration someone pays
 * for — so it needs inclusions, exclusions and a price, and it must not
 * inherit the itinerary schema's habit of estimating.
 *
 * `priceFrom`, `inclusions` and `exclusions` are deliberately optional and
 * empty by default. A package with no price renders as "price on request"
 * with an enquiry form; it never renders a guessed number, because a figure
 * on a page that reads as bookable is a quote.
 */
const packages = defineCollection({
  loader: glob({ pattern: ['**/*.md', '!README.md'], base: './src/content/packages' }),
  schema: z.object({
    title: z.string(),
    /** Country it runs in, matching geography.mjs. */
    country: z.string(),
    /** Nights is what a hotel sells; days is what a brochure counts. Both. */
    nights: z.number(),
    days: z.number(),
    summary: z.string(),
    /** "Tbilisi → Kazbegi → Kakheti" — the shape of the trip, shown on cards. */
    route: z.string().optional(),
    /** Per person, twin share. Unset until a rate is actually agreed. */
    priceFrom: z.number().optional(),
    priceCurrency: z.string().default('USD'),
    /** Struck-through "was" price. Only set it if the trip genuinely sold at it. */
    priceWas: z.number().optional(),
    /** What the rate covers, and what it does not. Unset until confirmed. */
    inclusions: z.array(z.string()).default([]),
    exclusions: z.array(z.string()).default([]),
    /** Six or so one-liners for the strip under the hero. */
    highlights: z.array(z.string()).default([]),
    /**
     * The day-by-day, structured rather than written as markdown headings.
     *
     * It was prose first. Structure won because each day wants a photograph
     * beside it and a meal line under it, and pulling those back out of
     * rendered HTML is guesswork that breaks the first time someone writes a
     * heading slightly differently.
     */
    itinerary: z
      .array(
        z.object({
          heading: z.string(),
          body: z.string(),
          /** 3:2 photograph, optional — the day renders fine without one. */
          image: z.string().optional(),
          /** "Breakfast", "Breakfast, dinner". Omit when none are provided. */
          meals: z.string().optional(),
        }),
      )
      .default([]),
    /**
     * Add-ons sold separately. Priced per person, same currency as the
     * package; a tour with no price shows as "on request" like the package.
     */
    optionalTours: z
      .array(
        z.object({
          name: z.string(),
          body: z.string(),
          image: z.string().optional(),
          adult: z.number().optional(),
          child: z.number().optional(),
        }),
      )
      .default([]),
    /** Fixed departures. Empty while the trip runs on request. */
    departures: z
      .array(
        z.object({
          date: z.coerce.date(),
          adult: z.number().optional(),
          single: z.number().optional(),
          child: z.number().optional(),
          /** 'available' | 'limited' | 'sold-out' — drives the badge. */
          status: z.enum(['available', 'limited', 'sold-out']).default('available'),
        }),
      )
      .default([]),
    /** Shown as an accordion, and emitted as FAQPage structured data. */
    faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    heroImage: z.string().optional(),
    heroWide: z.string().optional(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { itineraries, guides, packages };
