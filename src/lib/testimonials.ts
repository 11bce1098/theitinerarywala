/**
 * Reader quotes shown on the homepage.
 *
 * !! IMPORTANT !!
 * While PLACEHOLDER is true the section renders a visible "sample" banner,
 * because publishing invented reviews as if they were real would mislead
 * readers — and on a site that earns affiliate commission, that's the kind
 * of claim regulators care about.
 *
 * When you have genuine quotes: replace the entries below, set PLACEHOLDER
 * to false, and the banner disappears. If you'd rather ship without this
 * section for now, set SHOW to false.
 */
export const SHOW = true;
export const PLACEHOLDER = true;

export interface Testimonial {
  /** The quote itself — keep it to two or three sentences. */
  quote: string;
  /** Who said it. Real first name + city reads best. */
  name: string;
  /** Which itinerary they used, for context. */
  trip: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'The visa note at the top saved us a week of second-guessing — we checked one line, booked the flights that evening, and the whole trip came in close to the budget on the page.',
    name: 'Reader name, Dubai',
    trip: 'Georgia in 7 days with young kids',
  },
  {
    quote:
      'Capping the drives at two hours made the difference. Our four-year-old actually enjoyed it, and we never once had to rush a morning to make a booking.',
    name: 'Reader name, Sharjah',
    trip: 'Armenia in 5 days without long drives',
  },
];
