/**
 * Generates WebP variants of the hero images, so pages ship a fraction of
 * the bytes without anyone having to remember a manual step.
 *
 * Runs from `prebuild`, which means it also runs on Cloudflare. Sources stay
 * untouched in public/images and are still served as the fallback for the
 * few browsers without WebP. Output lands in public/images/opt/ and is
 * regenerated only when the source is newer, so repeat builds are instant.
 *
 * Widths are chosen from what the layout actually requests: cards render at
 * most ~460 CSS px and the phone hero at ~500, so 700 covers 1.5x and 1400
 * covers 3x. The wide hero panel tops out around 965 CSS px, so 1800 covers
 * a retina desktop.
 */
import { readdir, mkdir, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SRC_DIR = 'public/images';
const OUT_DIR = 'public/images/opt';
const CARD_WIDTHS = [700, 1400];
const WIDE_WIDTHS = [1800];
const QUALITY = 84;

/** Skip anything that is not a hero image. */
const isSource = (name) =>
  /\.(jpe?g|png)$/i.test(name) && !name.startsWith('og-card');

async function newerThan(src, out) {
  if (!existsSync(out)) return true;
  const [a, b] = await Promise.all([stat(src), stat(out)]);
  return a.mtimeMs > b.mtimeMs;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const files = (await readdir(SRC_DIR)).filter(isSource);

  let written = 0;
  let skipped = 0;

  for (const file of files) {
    const src = path.join(SRC_DIR, file);
    const base = file.replace(/\.[^.]+$/, '');
    const meta = await sharp(src).metadata();
    const isWide = (meta.width ?? 0) / (meta.height ?? 1) > 2;
    const widths = isWide ? WIDE_WIDTHS : CARD_WIDTHS;

    for (const width of widths) {
      // Never upscale: a 1600px source asked for 1800 stays at 1600.
      const target = Math.min(width, meta.width ?? width);
      const out = path.join(OUT_DIR, `${base}-${width}.webp`);
      if (!(await newerThan(src, out))) { skipped++; continue; }
      await sharp(src).resize({ width: target, withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(out);
      written++;
    }
  }

  await writeFile(path.join(OUT_DIR, '.gitignore'), '*\n');
  console.log(`[images] ${written} written, ${skipped} up to date`);
}

main().catch((error) => {
  // A failure here must not break the build: pages fall back to the sources.
  console.warn('[images] optimisation skipped:', error.message);
});
