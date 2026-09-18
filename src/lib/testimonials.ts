/**
 * Reader quotes for the homepage.
 *
 * Empty on purpose. The quotes that were here were drafted while building
 * the site, not written by travellers who had used these itineraries, so
 * they were removed rather than shown as reader feedback.
 *
 * When real ones arrive: add them below, set SHOW to true, and keep
 * PLACEHOLDER false. Only publish wording the person actually approved.
 */
export const SHOW = false;
export const PLACEHOLDER = false;

export interface Testimonial {
  quote: string;
  name: string;
  trip: string;
}

export const TESTIMONIALS: Testimonial[] = [];
