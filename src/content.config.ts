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
    // "Tashkent → Samarkand → Bukhara → Khiva" — shown on cards so someone
    // scrolling knows the shape of the trip without opening it.
    route: z.string().optional(),         // e.g. "Families with young kids"
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

export const collections = { itineraries };
