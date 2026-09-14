/**
 * Travelpayouts partner links.
 *
 * Reference these from markdown as `#aff:<key>` rather than pasting URLs:
 *
 *   <a class="book-btn" href="#aff:aviasales">Check flight prices</a>
 *
 * A rehype plugin (see astro.config.mjs) swaps in the real URL at build time
 * and adds rel="sponsored nofollow noopener" — Google requires rel="sponsored"
 * on paid links, and getting that wrong risks the whole site's ranking.
 * An unknown key fails the build rather than shipping a dead button.
 *
 * Changing a link here updates every page that uses it — but Astro caches
 * rendered markdown, so run `rm -rf .astro node_modules/.astro` before
 * rebuilding locally or you will keep seeing the old URL. Cloudflare builds
 * from a clean checkout, so deploys are unaffected.
 *
 * Missing: no hotel or stay partner is in this set yet.
 */
export const AFFILIATES = {
  // --- flights ---
  aviasales:       { name: 'Aviasales',        category: 'flights',      url: 'https://aviasales.tpk.lu/JDgIb2Wx',      use: 'Flight search and price comparison' },

  // --- tours, tickets and activities ---
  klook:           { name: 'Klook',            category: 'tours',        url: 'https://klook.tpk.lu/6ryCbNvc',          use: 'Activities and attraction tickets; strongest in Asia' },
  kkday:           { name: 'KKday',            category: 'tours',        url: 'https://kkday.tpk.lu/PYPPVhc6',          use: 'Day tours and experiences; strongest in Asia' },
  tiqets:          { name: 'Tiqets',           category: 'tours',        url: 'https://tiqets.tpk.lu/y1sbwsZ1',         use: 'Museum and attraction tickets, mostly Europe' },
  wegotrip:        { name: 'WeGoTrip',         category: 'tours',        url: 'https://wegotrip.tpk.lu/XgqMOc6H',       use: 'Self-guided audio tours' },
  gocity:          { name: 'Go City',          category: 'tours',        url: 'https://gocity.tpk.lu/K7qJ2dNF',         use: 'Multi-attraction city passes' },

  // --- airport transfers ---
  kiwitaxi:        { name: 'Kiwitaxi',         category: 'transfers',    url: 'https://kiwitaxi.tpk.lu/gUhdJIHh',       use: 'Pre-booked airport transfers' },
  welcomepickups:  { name: 'Welcome Pickups',  category: 'transfers',    url: 'https://tpk.lu/poRT2r0e',                use: 'Airport pickups with an English-speaking driver' },
  gettransfer:     { name: 'GetTransfer',      category: 'transfers',    url: 'https://gettransfer.tpk.lu/CTqjNE1j',    use: 'Private transfers, bid-based pricing' },
  intui:           { name: 'Intui',            category: 'transfers',    url: 'https://intui.tpk.lu/niC8ZeJG',          use: 'Airport transfers' },

  // --- car and bike hire ---
  localrent:       { name: 'LocalRent',        category: 'cars',         url: 'https://localrent.tpk.lu/wcTaboYu',      use: 'Local car hire; good in Georgia and Armenia' },
  getrentacar:     { name: 'GetRentacar',      category: 'cars',         url: 'https://getrentacar.tpk.lu/S9ddcxUS',    use: 'Car hire aggregator' },
  economybookings: { name: 'EconomyBookings',  category: 'cars',         url: 'https://economybookings.tpk.lu/cSN0vWEA', use: 'Budget car hire' },
  qeeq:            { name: 'QEEQ',             category: 'cars',         url: 'https://qeeq.tpk.lu/5rdcgCTF',           use: 'Car hire aggregator' },
  autoeurope:      { name: 'Auto Europe',      category: 'cars',         url: 'https://autoeurope.tpk.lu/CFsKeC9X',     use: 'Car hire, strongest in Europe' },
  bikesbooking:    { name: 'BikesBooking',     category: 'cars',         url: 'https://bikesbooking.tpk.lu/W6v0FKbC',   use: 'Bike and scooter hire' },

  // --- connectivity ---
  airalo:          { name: 'Airalo',           category: 'connectivity', url: 'https://airalo.tpk.lu/EEqLJR6J',         use: 'eSIM data abroad' },
  yesim:           { name: 'Yesim',            category: 'connectivity', url: 'https://yesim.tpk.lu/HQWT4FXb',          use: 'eSIM data abroad' },
  saily:           { name: 'Saily',            category: 'connectivity', url: 'https://saily.tpk.lu/VDLKlZe1',          use: 'eSIM data abroad' },
  drimsim:         { name: 'Drimsim',          category: 'connectivity', url: 'https://drimsim.tpk.lu/TizkpiIB',        use: 'International SIM and eSIM' },

  // --- insurance and claims ---
  ekta:            { name: 'EKTA',             category: 'insurance',    url: 'https://ektatraveling.tpk.lu/keceSBhH',  use: 'Travel medical insurance' },
  airhelp:         { name: 'AirHelp',          category: 'services',     url: 'https://airhelp.tpk.lu/8SJRNhEs',        use: 'Compensation for delayed or cancelled flights' },
  compensair:      { name: 'Compensair',       category: 'services',     url: 'https://compensair.tpk.lu/pOV6IIiL',     use: 'Compensation for delayed or cancelled flights' },

  // --- on the ground ---
  radicalstorage:  { name: 'Radical Storage',  category: 'services',     url: 'https://radicalstorage.tpk.lu/rKfzisnQ', use: 'Luggage storage by the hour' },
};

/** Resolve a key to its URL, failing loudly on a typo. */
export function affiliateUrl(key) {
  const entry = AFFILIATES[key];
  if (!entry) {
    throw new Error(
      `Unknown affiliate key "${key}". Known keys: ${Object.keys(AFFILIATES).join(', ')}`
    );
  }
  return entry.url;
}
