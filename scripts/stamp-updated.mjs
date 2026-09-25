/**
 * Keeps each guide's "Updated" date honest, automatically.
 *
 * Manual `updatedDate:` fields drift — they get forgotten on the revisions
 * that matter and bumped on ones that don't. Git can't answer this either:
 * `git log` on a working-tree edit reports the *previous* commit, so it is
 * always one change behind.
 *
 * So this hashes the part of each guide a reader would actually notice and
 * compares it with a committed manifest. Hash moved -> the content genuinely
 * changed -> stamp today. Hash identical -> leave the date alone, however
 * many times the site is rebuilt.
 *
 * Runs from prebuild. The manifest is committed alongside content, so a
 * rebuild months later reproduces the same dates rather than claiming
 * everything was updated on deploy day.
 */
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

const DIR = 'src/content/itineraries';
const MANIFEST = 'src/data/content-dates.json';

/**
 * Frontmatter a reader sees on the page. `updatedDate` is deliberately not
 * here — including it would make every stamp invalidate its own hash.
 * Ordering is fixed so a reordered file doesn't read as a content change.
 */
const TRACKED = [
  'title', 'country', 'days', 'route', 'bestFor', 'summary',
  'budgetAmount', 'budgetCurrency', 'heroImage', 'heroWide', 'visaNote',
];

const today = new Date().toISOString().slice(0, 10);

/** Body plus the tracked fields, whitespace-normalised. */
function fingerprint(raw) {
  const end = raw.indexOf('\n---', 3);
  const front = end === -1 ? '' : raw.slice(0, end);
  const body = end === -1 ? raw : raw.slice(end + 4);

  const fields = TRACKED.map((key) => {
    const match = front.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'));
    return `${key}=${(match?.[1] ?? '').trim()}`;
  }).join('\n');

  const text = `${fields}\n${body}`.replace(/\s+/g, ' ').trim();
  return createHash('sha256').update(text).digest('hex').slice(0, 16);
}

function publishDateOf(raw) {
  return raw.match(/^publishDate:\s*(\S+)/m)?.[1]?.slice(0, 10) ?? today;
}

function manualDateOf(raw) {
  return raw.match(/^updatedDate:\s*(\S+)/m)?.[1]?.slice(0, 10) ?? null;
}

const manifest = existsSync(MANIFEST)
  ? JSON.parse(await readFile(MANIFEST, 'utf8'))
  : {};

const files = (await readdir(DIR)).filter((f) => f.endsWith('.md'));
const next = {};
const changed = [];
const added = [];

for (const file of files.sort()) {
  const slug = file.replace(/\.md$/, '');
  const raw = await readFile(path.join(DIR, file), 'utf8');
  const hash = fingerprint(raw);
  const previous = manifest[slug];

  if (!previous) {
    // First sight of a guide: it was written, not revised. Seed from any
    // manual date, else its publish date — never from today, or a guide
    // imported later would claim a freshness it hasn't earned.
    next[slug] = { hash, updated: manualDateOf(raw) ?? publishDateOf(raw) };
    added.push(slug);
  } else if (previous.hash !== hash) {
    next[slug] = { hash, updated: today };
    changed.push(slug);
  } else {
    next[slug] = previous;
  }
}

const removed = Object.keys(manifest).filter((slug) => !(slug in next));

const before = JSON.stringify(manifest);
const after = JSON.stringify(next, null, 2) + '\n';

if (before !== JSON.stringify(next)) {
  await mkdir(path.dirname(MANIFEST), { recursive: true });
  await writeFile(MANIFEST, after);
}

for (const slug of added) console.log(`[dates] new      ${slug} -> ${next[slug].updated}`);
for (const slug of changed) console.log(`[dates] revised  ${slug} -> ${today}`);
for (const slug of removed) console.log(`[dates] dropped  ${slug}`);

if (changed.length || added.length || removed.length) {
  console.log(
    `[dates] ${MANIFEST} rewritten — commit it, or the next build will ` +
      're-stamp the same guides with a later date.',
  );
} else {
  console.log(`[dates] ok (${files.length} guides, no content changes)`);
}
