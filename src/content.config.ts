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
      .array(z.enum(['beach', 'nature', 'culture', 'couples', 'family']))
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

export const collections = { itineraries, guides };
