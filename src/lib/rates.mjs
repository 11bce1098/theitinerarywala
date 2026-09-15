/**
 * Live exchange rates, fetched once per build and refreshed in the browser.
 *
 * open.er-api.com is free, needs no key, allows cross-origin requests and
 * republishes daily. Everything degrades: if the fetch fails the site falls
 * back to the figure the author wrote, in the currency they wrote it in.
 */
export const RATES_URL = 'https://open.er-api.com/v6/latest/USD';

/** Where a reader can check the pair themselves. */
export function rateCheckUrl(from, to) {
  return `https://www.google.com/search?q=1+${from}+to+${to}`;
}

let cached;

/** Build-time fetch, memoised so one build makes a single request. */
export async function getRates() {
  if (cached !== undefined) return cached;
  try {
    const response = await fetch(RATES_URL, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error(String(response.status));
    const data = await response.json();
    if (data?.result !== 'success' || !data?.rates?.USD) throw new Error('unexpected shape');
    cached = { rates: data.rates, updated: data.time_last_update_utc ?? '' };
  } catch (error) {
    console.warn('[rates] live rates unavailable, using authored figures:', error?.message);
    cached = null;
  }
  return cached;
}

/** Convert between any two codes via the USD-based table. */
export function convert(amount, from, to, rates) {
  if (!rates || !rates[from] || !rates[to]) return null;
  return (amount / rates[from]) * rates[to];
}

/** "15 September 2026" from the API's RFC-1123 timestamp. */
export function rateDate(updated) {
  const parsed = new Date(updated);
  if (Number.isNaN(parsed.valueOf())) return '';
  return parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Whole units for big numbers, cents for small ones. */
export function formatMoney(amount, code) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: amount >= 100 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${Math.round(amount).toLocaleString('en-US')} ${code}`;
  }
}
