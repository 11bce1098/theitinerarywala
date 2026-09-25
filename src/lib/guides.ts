import { getCollection } from 'astro:content';

/**
 * Astro logs "the collection does not exist or is empty" for every page that
 * asks for an empty collection — 108 lines of noise during a build. Checking
 * the folder ourselves first keeps the empty case quiet and ordinary, which
 * it needs to be: the header, footer and /guides/ page all ask on every page,
 * and the folder is meant to sit empty until a guide is worth publishing.
 */
const files = import.meta.glob('/src/content/guides/*.md');
const hasGuides = Object.keys(files).some((f) => !f.endsWith('/README.md'));

/** Published guides, or an empty list. */
export async function getGuides() {
  if (!hasGuides) return [];
  return getCollection('guides', ({ data }) => !data.draft);
}
