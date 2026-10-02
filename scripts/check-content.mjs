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
 * 4. A hero image on the wrong side of the 2:1 line. optimise-images sorts
 *    sources by aspect ratio: wider than 2:1 gets a -1800 variant, anything
 *    else gets -700 and -1400. The templates request those widths by name,
 *    and a <picture> does not fall back when the chosen <source> 404s — so a
 *    'wide' that is really 1.6:1 ships a hero that silently fails to load.
 *    Ecuador shipped exactly that before this check existed.
 *
 * Runs from prebuild, so it fails the deploy rather than the deploy failing
 * quietly in public.
 */
import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const DIR = 'src/content/itineraries';

/** Every path the built site will actually serve from markdown links. */
const GUIDES_DIR = 'src/content/guides';
const PACKAGES_DIR = 'src/content/packages';

/**
 * Every path the built site will actually serve. Destination, continent and
 * style pages are generated from the itineraries themselves, so they are
 * derived below rather than listed.
 */
const PAGES = new Set([
  '/', '/about/', '/contact/', '/plan/', '/visa-services/', '/privacy/',
  '/itineraries/', '/guides/', '/packages/',
  '/destinations/', '/continents/', '/styles/',
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

// Packages are sold rather than described, so a broken link or a hero that
// fails to load costs more here than anywhere else on the site.
const packageFiles = (await readdir(PACKAGES_DIR))
  .filter((f) => f.endsWith('.md') && f !== 'README.md');
for (const file of packageFiles) PAGES.add(`/packages/${file.replace(/\.md$/, '')}/`);

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

/* Itineraries and packages share the hero and link rules; only the caveat
   check below is itinerary-specific, because only that template prints one. */
const scanned = [
  ...files.map((file) => ({ dir: DIR, file, itinerary: true })),
  ...packageFiles.map((file) => ({ dir: PACKAGES_DIR, file, itinerary: false })),
];

for (const { dir, file, itinerary } of scanned) {
  const body = await readFile(path.join(dir, file), 'utf8');

  for (const [, field, src] of body.matchAll(/^hero(Image|Wide):\s*"([^"]+)"/gm)) {
    const onDisk = path.join('public', src);
    if (!existsSync(onDisk)) {
      const alt = src.replace(/\.jpe?g$/, (m) => (m === '.jpg' ? '.jpeg' : '.jpg'));
      const hint = existsSync(path.join('public', alt)) ? ` — did you mean ${alt}?` : '';
      errors.push(`${file}: hero${field} points at missing ${src}${hint}`);
      continue;
    }

    /*
     * The 2:1 line decides which variants exist, and the templates ask for
     * them by name. Getting this wrong ships a hero that 404s rather than
     * one that looks wrong, so it has to fail the build.
     */
    let meta;
    try {
      meta = await sharp(onDisk).metadata();
    } catch (error) {
      warnings.push(`${file}: could not read ${src} (${error.message})`);
      continue;
    }
    const ratio = (meta.width ?? 0) / (meta.height ?? 1);
    const dims = `${meta.width}x${meta.height}, ${ratio.toFixed(2)}:1`;

    if (field === 'Wide' && ratio <= 2) {
      errors.push(
        `${file}: heroWide ${src} is ${dims} — must be wider than 2:1, or ` +
        'optimise-images builds -700/-1400 instead of the -1800 the hero ' +
        'asks for. Crop it to about 1800x700.',
      );
    }
    if (field === 'Image' && ratio > 2) {
      errors.push(
        `${file}: heroImage ${src} is ${dims} — must be 2:1 or narrower, or ` +
        'optimise-images builds only -1800 and the card srcset 404s. ' +
        'Crop it to about 1600x1000.',
      );
    }
  }

  /*
   * Day photographs in a package's structured itinerary. Same failure as a
   * hero pointing at nothing, but quieter: the page still renders, with a
   * broken thumbnail beside the day someone is deciding whether to buy.
   */
  for (const [, src] of body.matchAll(/^\s+image:\s*"([^"]+)"/gm)) {
    if (!existsSync(path.join('public', src))) {
      errors.push(`${file}: day image points at missing ${src}`);
    }
  }

  // Root-relative links only; external ones are not ours to verify.
  for (const [, label, href] of body.matchAll(/\[([^\]]*)\]\((\/[^)\s#]*)(?:#[^)\s]*)?\)/g)) {
    const normalised = href.endsWith('/') || href.includes('.') ? href : `${href}/`;
    if (!PAGES.has(normalised) && !existsSync(path.join('public', href))) {
      errors.push(`${file}: link "${label}" points at ${href}, which is not a page`);
    }
  }

  if (itinerary && CAVEAT.test(body)) {
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
