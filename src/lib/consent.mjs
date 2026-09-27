/**
 * EEA consent, shared between the inline tag in <head> and the banner script.
 *
 * The site keeps Google Analytics because it feeds Google Ads. That means
 * cookies, which in the EEA, the UK and Switzerland need consent before they
 * are set — so the tag starts denied *there only*, and a banner asks. The
 * rest of the world is untouched: Consent Mode treats any region you do not
 * name as granted, so no one outside these countries ever sees a banner.
 */

/** EU 27, the three non-EU EEA states, the UK, and Switzerland. */
export const CONSENT_REGIONS = [
  // EU 27
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
  'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
  'SI', 'ES', 'SE',
  // EEA but not EU
  'IS', 'LI', 'NO',
  // Not EEA, but equivalent law and the same expectation
  'GB', 'CH',
];

/** Where the visitor's choice is remembered. Same prefix as the rest. */
export const CONSENT_KEY = 'tiw:consent';

/**
 * The four signals Consent Mode v2 expects. Analytics and ads are split so a
 * later "analytics only" option would be a one-line change.
 */
export const GRANTED = {
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted',
  analytics_storage: 'granted',
};

export const DENIED = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
};
