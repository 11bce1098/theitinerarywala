import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const itineraries = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/itineraries' }),
  schema: z.object({
    title: z.string(),
    country: z.string(),
    days: z.number(),
    budgetPerPerson: z.string(), // e.g. "AED 3,200" — keep it a display string
    visaNote: z.string(),        // the visa-smart hook, e.g. "Visa-free for UAE residents"
    bestFor: z.string(),         // e.g. "Families with young kids"
    summary: z.string(),         // one or two sentences for cards + meta description
    heroImage: z.string().optional(), // path under /public, e.g. /images/georgia.jpg
    publishDate: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { itineraries };
