/**
 * Catches the two mistakes that keep recurring when an itinerary is added.
 *
 * 1. heroImage/heroWide pointing at a file that is not there — the build
 *    succeeds and the page ships a broken image, which nobody notices until
 *    someone looks. Usually a .jpg/.jpeg mix-up.
 * 2. The file carrying its own closing caveat, which the page template
 *    already prints, so readers see it twice.
 * 3. An internal link to a page that does not exist. These used to render
 *    the homepage with a 200 (Pages falls back to index.html), so a wrong
 *    path looked fine; now they 404 properly, which is honest but still
 *    broken. Nine of them had shipped before this check existed.
 *
 * Runs from prebuild, so it fails the deploy rather than the deploy failing
 * quietly in public.
 */
import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const DIR = 'src/content/itineraries';

/** Every path the built site will actually serve from markdown links. */
const GUIDES_DIR = 'src/content/guides';

/**
 * Every path the built site will actually serve. Destination, continent and
 * style pages are generated from the itineraries themselves, so they are
 * derived below rather than listed.
 */
const PAGES = new Set([
  '/', '/about/', '/contact/', '/plan/', '/visa-services/',
  '/itineraries/', '/guides/', '/destinations/', '/continents/', '/styles/',
]);
const CAVEAT = /^\*[^*\n]*(?:checked|rules can change|confirm[^*]*before you book)[^*]*\*$/ms;

const errors = [];
const warnings = [];

const files = (await readdir(DIR)).filter((f) => f.endsWith('.md'));
for (const file of files) PAGES.add(`/itineraries/${file.replace(/\.md$/, '')}/`);

// Guides are a separate collection, and itineraries link into them.
const guideFiles = (await readdir(GUIDES_DIR))
  .filter((f) => f.endsWith('.md') && f !== 'README.md');
for (const file of guideFiles) PAGES.add(`/guides/${file.replace(/\.md$/, '')}/`);

// Country, continent and style pages the itineraries can link to.
for (const file of files) {
  const src = await readFile(path.join(DIR, file), 'utf8');
  const country = /^country: *"?([^"\n]+)"?/m.exec(src)?.[1]?.trim();
  if (country) {
    PAGES.add(`/destinations/${country.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/`);
  }
}
for (const c of ['asia', 'europe', 'africa', 'north-america', 'south-america', 'oceania']) {
  PAGES.add(`/continents/${c}/`);
}
for (const st of ['beach', 'nature', 'culture', 'couples', 'family', 'budget']) {
  PAGES.add(`/styles/${st}/`);
}

for (const file of files) {
  const body = await readFile(path.join(DIR, file), 'utf8');

  for (const [, field, src] of body.matchAll(/^hero(Image|Wide):\s*"([^"]+)"/gm)) {
    if (!existsSync(path.join('public', src))) {
      const alt = src.replace(/\.jpe?g$/, (m) => (m === '.jpg' ? '.jpeg' : '.jpg'));
      const hint = existsSync(path.join('public', alt)) ? ` — did you mean ${alt}?` : '';
      errors.push(`${file}: hero${field} points at missing ${src}${hint}`);
    }
  }

  // Root-relative links only; external ones are not ours to verify.
  for (const [, label, href] of body.matchAll(/\[([^\]]*)\]\((\/[^)\s#]*)(?:#[^)\s]*)?\)/g)) {
    const normalised = href.endsWith('/') || href.includes('.') ? href : `${href}/`;
    if (!PAGES.has(normalised) && !existsSync(path.join('public', href))) {
      errors.push(`${file}: link "${label}" points at ${href}, which is not a page`);
    }
  }

  if (CAVEAT.test(body)) {
    warnings.push(`${file}: has its own closing caveat; the template already prints one`);
  }
}

for (const w of warnings) console.warn(`[content] warning  ${w}`);

if (errors.length > 0) {
  for (const e of errors) console.error(`[content] ERROR    ${e}`);
  console.error(`\n[content] ${errors.length} problem(s) — fix before deploying.`);
  process.exit(1);
}
console.log(`[content] ok (${warnings.length} warning(s))`);
