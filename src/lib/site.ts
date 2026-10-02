/**
 * Single source of truth for nav, contact details and social links, so the
 * header, footer and contact page can't drift apart.
 *
 * The address here is also the fallback the contact form and newsletter
 * signup tell people to write to when a submission fails, so it has to be
 * one that actually receives mail — not just one that looks right.
 */
export const SITE = {
  name: 'The Itinerary Wala',
  tagline: 'Travel less like a tourist. Plan more like a local.',
  description:
    'Day-by-day travel itineraries with realistic pacing, real-number budgets, and practical links to help you book your trip.',
  email: 'hello@theitinerarywala.com',
  instagram: 'https://instagram.com/theitinerarywala',
  /** @handle on X, used for twitter:site/creator attribution. */
  xHandle: '@itinerarywala',
  // Branded 1200x630 social preview, used when a page has no image of its own.
  ogImage: '/images/og-card.jpg',
} as const;

export interface Social {
  key: string;
  label: string;
  url: string;
}

/**
 * Social profiles shown in the header and footer.
 *
 * All three URLs are the canonical form — checked to resolve without a
 * redirect, so a click does not make an extra hop.
 *
 * YouTube, Pinterest and X are listed with empty urls: fill one in and its
 * icon appears in the header and footer automatically. An empty url is
 * skipped, so unused networks never render.
 */
export const SOCIALS: Social[] = [
  { key: 'instagram', label: 'Instagram', url: SITE.instagram },
  { key: 'facebook',  label: 'Facebook',  url: 'https://www.facebook.com/theitinerarywala' },
  { key: 'threads',   label: 'Threads',   url: 'https://www.threads.net/@theitinerarywala' },
  { key: 'youtube',   label: 'YouTube',   url: 'https://www.youtube.com/@theitinerarywala' },
  { key: 'pinterest', label: 'Pinterest', url: '' },
  { key: 'x',         label: 'X',         url: 'https://x.com/itinerarywala' },
];

/** Only the ones with a URL actually set. */
export const ACTIVE_SOCIALS = SOCIALS.filter((s) => s.url.trim().length > 0);

export interface NavLink {
  href: string;
  label: string;
  /** Renders the continent flyout under this item. */
  menu?: 'continents';
  /** Styled as the primary action rather than a nav link. */
  cta?: boolean;
  /**
   * Kept out of the header, shown in the footer.
   *
   * The header has room for about five things before it stops being a
   * signpost, and "Guides" sitting next to "Visa & Entry" made two items
   * that read as the same thing. Guides earn their traffic from the
   * itineraries that link to them and from search; promote this back to
   * the header once the section is big enough to be worth the slot.
   */
  footerOnly?: boolean;
}

/**
 * Itinerary ids to feature on the homepage, in order.
 * TODO(owner): reorder as you learn which ones actually convert.
 */
/**
 * Search shortcuts under the homepage hero. Deliberately curated rather than
 * "countries with the most guides", which surfaced India, Russia and Germany —
 * true, but not what the site is best at selling.
 */
export const POPULAR_DESTINATIONS = [
  'Japan',
  'Thailand',
  'Vietnam',
  'Turkey',
  'Georgia',
  'Uzbekistan',
];

export const POPULAR = [
  'uzbekistan-9-days-guide',
  'georgia-7-days-guide',
  'japan-10-days-guide',
  'turkey-11-days-guide',
];

/**
 * "Packages", not "Holiday Packages": the header has five slots and the
 * fuller phrase is twice the width of anything beside it. The page itself
 * is titled "Georgia holiday packages", which is the phrase people search
 * — the nav only has to be unambiguous next to "Itineraries", and it is:
 * itineraries are free plans you book yourself, packages are sold.
 *
 * Visa & Entry moves to the footer to make room. The page still describes
 * something real, but it is the one header item that was answering a
 * question every itinerary already answers inline.
 */
export const NAV: NavLink[] = [
  { href: '/itineraries/', label: 'Itineraries', menu: 'continents' },
  { href: '/packages/', label: 'Packages' },
  { href: '/guides/', label: 'Guides', footerOnly: true },
  { href: '/visa-services/', label: 'Visa & Entry', footerOnly: true },
  { href: '/about/', label: 'About' },
  { href: '/contact/', label: 'Contact' },
  { href: '/plan/', label: 'Plan My Trip', cta: true },
  { href: '/privacy/', label: 'Privacy', footerOnly: true },
];

/**
 * Google Analytics 4 measurement ID.
 *
 * Not a secret — it ships in the HTML of every page, which is why it sits
 * here rather than in an env var you have to remember to set. Override it
 * with PUBLIC_GA_ID to point a fork or a staging property somewhere else,
 * or set that to an empty string to switch analytics off entirely.
 *
 * The tag only sends data from the live domain: see Base.astro. Local
 * builds and Cloudflare preview deploys load the library but report
 * nothing, so the numbers stay clean.
 */
export const GA_ID: string = import.meta.env.PUBLIC_GA_ID ?? 'G-9BNKKY6SWJ';

/** The only hostname that reports analytics. Anything else is a preview. */
export const ANALYTICS_HOST = 'theitinerarywala.com';

/**
 * Where the contact and newsletter forms POST.
 *
 * Set PUBLIC_WEB3FORMS_KEY to your Web3Forms access key and the endpoint is
 * inferred. PUBLIC_FORM_ENDPOINT overrides it for any other service. With
 * neither set the forms fall back to opening the visitor's mail client, so
 * the page is never a dead end — it just isn't as smooth.
 *
 * Both are read at build time, so changing them needs a redeploy.
 */
export const WEB3FORMS_KEY: string = import.meta.env.PUBLIC_WEB3FORMS_KEY ?? '';

const CUSTOM_ENDPOINT: string = import.meta.env.PUBLIC_FORM_ENDPOINT ?? '';

/** Currencies a reader can switch between; the first is the default. */
export { DISPLAY_CURRENCIES, DEFAULT_CURRENCY } from './currency.mjs';

export const FORM_ENDPOINT: string =
  CUSTOM_ENDPOINT.trim() ||
  (WEB3FORMS_KEY.trim() ? 'https://api.web3forms.com/submit' : '');

/** True when a real endpoint is configured. */
export const HAS_FORM_ENDPOINT = FORM_ENDPOINT.trim().length > 0;

/** Marks a nav link current, treating "/" as an exact match only. */
export function isCurrent(href: string, pathname: string): boolean {
  const here = pathname.endsWith('/') ? pathname : `${pathname}/`;
  if (href === '/') return here === '/';
  return here === href || here.startsWith(href);
}
