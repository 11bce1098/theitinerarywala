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
 * Budget as the whole trip, per person, in USD.
 *
 * It used to be cost per day, which sorted honestly but asked the reader to
 * do arithmetic before they could recognise their own trip. People book a
 * budget for a holiday, not for a night. The thresholds stay in USD because
 * that is what the cards are normalised to; the labels are converted to
 * whatever currency the reader has chosen.
 */
export const BUDGET_BANDS = [
  { slug: 'budget', label: 'Budget', min: 0, max: 1000 },
  { slug: 'mid', label: 'Mid-range', min: 1000, max: 2000 },
  { slug: 'premium', label: 'Premium', min: 2000, max: Infinity },
];

/** Two significant figures, so a converted threshold reads as a round number. */
function roundish(value) {
  if (value <= 0) return 0;
  const step = 10 ** (Math.floor(Math.log10(value)) - 1);
  return Math.round(value / step) * step;
}

export function formatThreshold(usd, currency, rates) {
  const rate = rates?.[currency];
  const value = roundish(rate ? usd * rate : usd);
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency, maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${Math.round(value).toLocaleString('en-US')}`;
  }
}

/** "Under ₹110,000", "₹110,000–₹220,000", "Over ₹220,000". */
export function bandRange(band, currency, rates) {
  const lo = formatThreshold(band.min, currency, rates);
  const hi = band.max === Infinity ? null : formatThreshold(band.max, currency, rates);
  if (band.min === 0 && hi) return `Under ${hi}`;
  if (!hi) return `Over ${lo}`;
  return `${lo}\u2013${hi}`;
}

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
