/**
 * The trip finder's two numeric dimensions.
 *
 * Both live here rather than in the two pages that use them, because the
 * homepage hands its answers to /itineraries/ through the URL: if the bands
 * drifted apart, a link built on the homepage would filter to something else
 * on arrival, or to nothing at all.
 *
 * Every band is [min, max) so the two edges can never both claim a trip.
 */

/** Trip length. Bands, not a number, because nobody wants exactly 9 days. */
export const DAY_BANDS = [
  { slug: 'short', label: 'A short break', short: 'Up to 5 days', min: 1, max: 6 },
  { slug: 'week', label: 'About a week', short: '6–8 days', min: 6, max: 9 },
  { slug: 'ten', label: 'Nine to twelve days', short: '9–12 days', min: 9, max: 13 },
  { slug: 'long', label: 'Thirteen days or more', short: '13+ days', min: 13, max: Infinity },
];

/**
 * Budget as cost per person per day, in USD.
 *
 * Total budget can't be compared across trips — a $3,000 fortnight is cheaper
 * going than a $1,500 long weekend — and a currency label on the control would
 * only be right for whoever happens to be reading. Per-day in one currency is
 * the only version of this question that sorts honestly.
 */
export const BUDGET_BANDS = [
  { slug: 'budget', label: 'Budget', short: 'Under $100 a day', min: 0, max: 100 },
  { slug: 'mid', label: 'Mid-range', short: '$100–200 a day', min: 100, max: 200 },
  { slug: 'premium', label: 'Premium', short: 'Over $200 a day', min: 200, max: Infinity },
];

export const inBand = (band, value) =>
  value !== null && value !== undefined && value >= band.min && value < band.max;

/** Cost per person per day, or null when a trip has no budget on it. */
export function perDay(usdTotal, days) {
  if (!usdTotal || !days || usdTotal >= Number.MAX_SAFE_INTEGER) return null;
  return usdTotal / days;
}

/**
 * Only the bands that actually match something.
 *
 * Offering "up to 5 days" when the shortest trip on the site is six is a
 * dead end dressed up as a choice, and the answer shifts every time a guide
 * is added — so the options are derived from the library rather than guessed.
 */
export function bandsWithTrips(bands, values) {
  return bands.filter((band) => values.some((value) => inBand(band, value)));
}
