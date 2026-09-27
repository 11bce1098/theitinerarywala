/**
 * The currencies a reader can switch the site into.
 *
 * Shared by the build (which renders the first paint), the client script
 * (which re-renders on change) and the switcher itself — they have to agree,
 * and this used to be declared separately in each.
 */
export const DISPLAY_CURRENCIES = ['INR', 'AED', 'USD'];

/** What a page renders as before the reader has chosen anything. */
export const DEFAULT_CURRENCY = DISPLAY_CURRENCIES[0];
