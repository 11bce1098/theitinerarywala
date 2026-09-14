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
} as const;

export interface NavLink {
  href: string;
  label: string;
}

export const NAV: NavLink[] = [
  { href: '/', label: 'Itineraries' },
  { href: '/about/', label: 'About' },
  { href: '/contact/', label: 'Contact' },
];

/**
 * Where the contact and newsletter forms POST.
 *
 * Set PUBLIC_FORM_ENDPOINT in a .env file (or in the Cloudflare Pages
 * dashboard) to a form service such as Formspree or Web3Forms. When it's
 * empty the forms fall back to opening the visitor's mail client, so the
 * page is never a dead end — it just isn't as smooth.
 */
export const FORM_ENDPOINT: string = import.meta.env.PUBLIC_FORM_ENDPOINT ?? '';

/** True when a real endpoint is configured. */
export const HAS_FORM_ENDPOINT = FORM_ENDPOINT.trim().length > 0;

/** Marks a nav link current, treating "/" as an exact match only. */
export function isCurrent(href: string, pathname: string): boolean {
  const here = pathname.endsWith('/') ? pathname : `${pathname}/`;
  if (href === '/') return here === '/';
  return here === href || here.startsWith(href);
}
