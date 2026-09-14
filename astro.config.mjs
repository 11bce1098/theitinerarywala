import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Used for the sitemap, robots.txt and the canonical/og:url tags.
  // Must match the domain the site is actually served from.
  site: 'https://theitinerarywala.com',
  integrations: [sitemap()],
});
