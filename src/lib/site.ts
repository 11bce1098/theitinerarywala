/**
 * Single source of truth for nav, contact details and social links, so the
 * header, footer and contact page can't drift apart.
 *
 * TODO(owner): swap the gmail address for a domain address
 * (hello@theitinerarywala.com) once mail is set up on the domain.
 */
export const SITE = {
  name: 'The Itinerary Wala',
  tagline: 'Visa-smart family itineraries',
  description:
    'Day-by-day travel itineraries for families on Indian passports with UAE residence: visa notes, real budgets, and bookable plans.',
  email: 'theitinerarywala@gmail.com',
  instagram: 'https://instagram.com/theitinerarywala',
  // Branded 1200x630 social preview, used when a page has no image of its own.
  ogImage: '/images/og-card.jpg',
} as const;

export interface NavLink {
  href: string;
  label: string;
  /** Renders the continent flyout under this item. */
  menu?: 'continents';
}

export const NAV: NavLink[] = [
  { href: '/', label: 'Itineraries', menu: 'continents' },
  { href: '/visa-services/', label: 'Visa services' },
  { href: '/about/', label: 'About' },
  { href: '/contact/', label: 'Contact' },
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
