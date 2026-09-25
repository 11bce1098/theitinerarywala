import { readdirSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { AFFILIATES } from './src/lib/affiliates.mjs';
import { getRates, convert, formatMoney } from './src/lib/rates.mjs';
import remarkGfm from 'remark-gfm';

/**
 * Rewrites `href="#aff:<key>"` in markdown to the real partner URL and tags
 * it correctly.
 *
 * rel="sponsored" is what Google asks for on paid links; "nofollow" is the
 * older signal and harmless to keep alongside it. An unknown key throws, so
 * a typo fails the build instead of shipping a button that goes nowhere.
 */
function resolve(key) {
  const entry = AFFILIATES[key];
  if (!entry) {
    throw new Error(
      `Unknown affiliate key "${key}" in markdown. ` +
        `Known keys: ${Object.keys(AFFILIATES).join(', ')}`
    );
  }
  return entry.url;
}

const hasGuides = readdirSync('./src/content/guides')
  .some((f) => f.endsWith('.md') && f !== 'README.md');

const RAW_AFF_HREF = /href=(["'])#aff:([A-Za-z0-9_-]+)\1/g;

/** `{{GEL 1800}}` or `{{GEL 30-50}}` in markdown prose or a table cell. */
const MONEY = /\{\{([A-Z]{3})\s+([\d,]+(?:\s*[-–]\s*[\d,]+)?)\}\}/g;

const num = (text) => Number(String(text).replace(/,/g, ''));

/**
 * Turns a money token into "GEL 1,800 (≈ $665)".
 *
 * The conversion is computed at build time so it is right without JS, and
 * carries data attributes so the client can refresh it against the day's
 * rate. Without live rates it degrades to the original amount alone.
 */
function moneyNode(code, amountText, rates) {
  const parts = amountText.split(/\s*[-–]\s*/).map(num);
  const usd = parts.map((n) => convert(n, code, 'USD', rates));
  const original = parts.map((n) => n.toLocaleString('en-US')).join('–');
  const children = [{ type: 'text', value: `${code} ${original}` }];

  if (usd.every((v) => v !== null)) {
    children.push({
      type: 'element',
      tagName: 'span',
      properties: { className: ['money-conv'] },
      children: [{ type: 'text', value: ` (≈ ${usd.map((v) => formatMoney(v, 'USD')).join('–')})` }],
    });
  }

  return {
    type: 'element',
    tagName: 'span',
    properties: {
      className: ['money'],
      'data-money': '',
      'data-amounts': parts.join(','),
      'data-from': code,
    },
    children,
  };
}

function affiliateLinks() {
  return async (tree) => {
    const rates = (await getRates())?.rates ?? null;
    const walk = (node) => {
      // Booking buttons are written as raw HTML in the markdown, which stays
      // an unparsed `raw` node — so patch the string, not element properties.
      if (node.type === 'raw' && typeof node.value === 'string') {
        node.value = node.value.replace(RAW_AFF_HREF, (_match, quote, key) => {
          const url = resolve(key);
          return (
            `href=${quote}${url}${quote}` +
            ` rel=${quote}sponsored nofollow noopener${quote}` +
            ` target=${quote}_blank${quote}`
          );
        });
      }

      // Money tokens live in ordinary prose, so patch the text nodes.
      if (node.type === 'element' && Array.isArray(node.children)) {
        let touched = false;
        const next = [];
        for (const child of node.children) {
          if (child.type !== 'text' || !child.value.includes('{{')) {
            next.push(child);
            continue;
          }
          MONEY.lastIndex = 0;
          let last = 0;
          let match;
          while ((match = MONEY.exec(child.value)) !== null) {
            if (match.index > last) {
              next.push({ type: 'text', value: child.value.slice(last, match.index) });
            }
            next.push(moneyNode(match[1], match[2], rates));
            last = match.index + match[0].length;
            touched = true;
          }
          if (!touched) { next.push(child); continue; }
          if (last < child.value.length) {
            next.push({ type: 'text', value: child.value.slice(last) });
          }
        }
        if (touched) node.children = next;
      }

      // Markdown-syntax links, e.g. [Check flights](#aff:aviasales).
      if (node.type === 'element' && node.tagName === 'a') {
        const href = node.properties?.href;
        if (typeof href === 'string' && href.startsWith('#aff:')) {
          node.properties.href = resolve(href.slice('#aff:'.length));
          node.properties.rel = 'sponsored nofollow noopener';
          node.properties.target = '_blank';
        }
      }

      for (const child of node.children ?? []) walk(child);
    };
    walk(tree);
  };
}

export default defineConfig({
  // Used for the sitemap, robots.txt and the canonical/og:url tags.
  // Must match the domain the site is actually served from.
  site: 'https://theitinerarywala.com',
  integrations: [
    sitemap({
      /**
       * /guides/ is a real page but shows a placeholder until the first
       * guide lands. Submitting an empty page is how you earn "Discovered —
       * currently not indexed", so it stays out of the sitemap until then.
       */
      filter: (page) => !(new URL(page).pathname === '/guides/' && !hasGuides),
    }),
  ],
  markdown: {
    // GFM treats a single ~ as strikethrough, so an itinerary line with two
    // approximations — "(~9:00-17:00)" and "(~¥2,000)" — struck out
    // everything between them. Re-add GFM with that turned off; tables,
    // autolinks and the rest are unaffected.
    gfm: false,
    remarkPlugins: [[remarkGfm, { singleTilde: false }]],
    rehypePlugins: [affiliateLinks],
  },
});
