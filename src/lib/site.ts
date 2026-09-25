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
    'Day-by-day travel itineraries with realistic pacing, budgets in real numbers, and every stay and tour bookable in one tap.',
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
}

/**
 * Itinerary ids to feature on the homepage, in order.
 * TODO(owner): reorder as you learn which ones actually convert.
 */
export const POPULAR = [
  'uzbekistan-9-days-guide',
  'georgia-7-days-guide',
  'japan-10-days-guide',
  'turkey-11-days-guide',
];

export const NAV: NavLink[] = [
  { href: '/itineraries/', label: 'Itineraries', menu: 'continents' },
  { href: '/visa-services/', label: 'Visa & Entry' },
  { href: '/about/', label: 'About' },
  { href: '/contact/', label: 'Contact' },
  { href: '/plan/', label: 'Plan My Trip', cta: true },
];

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
export const DISPLAY_CURRENCIES = ['INR', 'AED', 'USD'] as const;
export const DEFAULT_CURRENCY = DISPLAY_CURRENCIES[0];

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
