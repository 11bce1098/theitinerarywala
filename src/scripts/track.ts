/**
 * Send a GA4 event, if the tag is there at all.
 *
 * Every call sits on the line *after* a request has come back successful,
 * never next to the submit handler. GA4's own enhanced measurement already
 * fires `form_submit`, but it fires on the submit event — which happens
 * whether or not the POST that follows works. Marking that as a key event
 * would have Google Ads bidding against a number that silently counts
 * failures and bot submissions as conversions.
 *
 * No-ops in dev and wherever the tag is absent, so nothing here needs
 * guarding at the call site. Consent is handled upstream: a visitor who
 * declined is already in a denied state, and gtag drops or anonymises the
 * event accordingly.
 */
export function track(name: string, params: Record<string, unknown> = {}): void {
  window.gtag?.('event', name, params);
}
