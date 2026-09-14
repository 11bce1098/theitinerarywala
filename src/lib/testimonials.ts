/**
 * Reader quotes shown on the homepage.
 *
 * These are real, approved quotes — each person confirmed the wording before
 * it went up. If you add more, get the same confirmation first and keep
 * PLACEHOLDER false; flip it to true only if you ever put sample text here
 * again, which renders a visible "these are samples" banner.
 */
export const SHOW = true;
export const PLACEHOLDER = false;

export interface Testimonial {
  /** The quote itself — keep it to two or three sentences. */
  quote: string;
  /** Who said it. */
  name: string;
  /** Which itinerary they used, for context. */
  trip: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "The visa line at the top is what sold me — one sentence and I knew we could actually go. We followed the Kazbegi days almost exactly and the drive times were honest, which matters when you're travelling with a small kid.",
    name: 'Tanay Likhar',
    trip: 'Georgia in 7 days with young kids',
  },
  {
    quote:
      "I've planned enough trips to know how optimistic most itineraries are about distances. This one wasn't. Budget came out close to what the page said, and nothing needed rearranging once we were there.",
    name: 'Bishwa Bhushan Agrawal',
    trip: 'Georgia in 7 days with young kids',
  },
];
