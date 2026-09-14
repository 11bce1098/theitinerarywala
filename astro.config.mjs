import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { AFFILIATES } from './src/lib/affiliates.mjs';

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

const RAW_AFF_HREF = /href=(["'])#aff:([A-Za-z0-9_-]+)\1/g;

function affiliateLinks() {
  return (tree) => {
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
  integrations: [sitemap()],
  markdown: {
    rehypePlugins: [affiliateLinks],
  },
});
