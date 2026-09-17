/**
 * Catches the two mistakes that keep recurring when an itinerary is added.
 *
 * 1. heroImage/heroWide pointing at a file that is not there — the build
 *    succeeds and the page ships a broken image, which nobody notices until
 *    someone looks. Usually a .jpg/.jpeg mix-up.
 * 2. The file carrying its own closing caveat, which the page template
 *    already prints, so readers see it twice.
 *
 * Runs from prebuild, so it fails the deploy rather than the deploy failing
 * quietly in public.
 */
import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const DIR = 'src/content/itineraries';
const CAVEAT = /^\*[^*\n]*(?:checked|rules can change|confirm[^*]*before you book)[^*]*\*$/ms;

const errors = [];
const warnings = [];

for (const file of (await readdir(DIR)).filter((f) => f.endsWith('.md'))) {
  const body = await readFile(path.join(DIR, file), 'utf8');

  for (const [, field, src] of body.matchAll(/^hero(Image|Wide):\s*"([^"]+)"/gm)) {
    if (!existsSync(path.join('public', src))) {
      const alt = src.replace(/\.jpe?g$/, (m) => (m === '.jpg' ? '.jpeg' : '.jpg'));
      const hint = existsSync(path.join('public', alt)) ? ` — did you mean ${alt}?` : '';
      errors.push(`${file}: hero${field} points at missing ${src}${hint}`);
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
