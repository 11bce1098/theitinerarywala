/**
 * Where each destination sits, for the continent menu and continent pages.
 *
 * Keyed by the exact `country` string used in itinerary frontmatter. An
 * unmapped country fails the build rather than quietly vanishing from the
 * menu — see continentFor().
 *
 * Caucasus and Central Asian countries are transcontinental and different
 * atlases place them differently; these follow the common travel-industry
 * grouping. Reassigning one is a single edit here.
 */
export const COUNTRIES = {
  Armenia:    { continent: 'asia',   region: 'Caucasus',        currency: 'AMD' },
  Georgia:    { continent: 'asia',   region: 'Caucasus',        currency: 'GEL' },
  Japan:      { continent: 'asia',   region: 'East Asia',       currency: 'JPY' },
  UAE:        { continent: 'asia',   region: 'Middle East',     currency: 'AED' },
  Uzbekistan: { continent: 'asia',   region: 'Central Asia',    currency: 'UZS' },
  Russia:     { continent: 'europe', region: 'Eastern Europe',  currency: 'RUB' },
};

export const CONTINENTS = [
  { slug: 'asia',          name: 'Asia',          blurb: 'Enormous variety, and often the shortest flights to get there.' },
  { slug: 'europe',        name: 'Europe',        blurb: 'Longer flights, more paperwork, and worth the planning.' },
  { slug: 'africa',        name: 'Africa',        blurb: 'Closer than it looks, and easier to reach than most expect.' },
  { slug: 'north-america', name: 'North America', blurb: 'Long-haul trips that need real lead time.' },
  { slug: 'south-america', name: 'South America', blurb: 'The longest flights, and the ones worth the most planning.' },
  { slug: 'oceania',       name: 'Oceania',       blurb: 'Far, expensive, and unlike anywhere else on this list.' },
];

/** Continent slug for a country, or a loud failure if it is unmapped. */
export function continentFor(country) {
  const entry = COUNTRIES[country];
  if (!entry) {
    throw new Error(
      `Country "${country}" is not in src/lib/geography.mjs. ` +
        `Add it so it appears in the continent menu. ` +
        `Known: ${Object.keys(COUNTRIES).join(', ')}`
    );
  }
  return entry.continent;
}

/** URL-safe id for a region, used for menu links and page anchors. */
export function regionSlug(region) {
  return region.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function regionFor(country) {
  return COUNTRIES[country]?.region ?? '';
}

/** ISO code of the destination's own currency. */
export function currencyFor(country) {
  return COUNTRIES[country]?.currency ?? 'USD';
}

/**
 * Groups published itineraries into continents.
 *
 * Only continents that actually have itineraries come back, so the menu
 * never advertises an empty page.
 */
export function groupByContinent(itineraries) {
  const byContinent = new Map();

  for (const itin of itineraries) {
    const slug = continentFor(itin.data.country);
    if (!byContinent.has(slug)) byContinent.set(slug, new Map());
    const countries = byContinent.get(slug);
    const name = itin.data.country;
    if (!countries.has(name)) countries.set(name, []);
    countries.get(name).push(itin);
  }

  // Every continent comes back, including empty ones — those render as
  // "coming soon" rather than being hidden, so the menu shows the full map.
  return CONTINENTS.map((c) => {
    const countries = [...(byContinent.get(c.slug)?.entries() ?? [])]
      .map(([name, items]) => ({
        name,
        region: regionFor(name),
        itineraries: items.sort(
          (a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf()
        ),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    // Countries also come back grouped by region, so the menu can offer
    // continent -> region -> country instead of one long country list.
    const regions = [...new Set(countries.map((x) => x.region))]
      .sort()
      .map((name) => ({
        name,
        slug: regionSlug(name),
        countries: countries.filter((x) => x.region === name),
      }));

    return {
      ...c,
      countries,
      regions,
      itineraryCount: countries.reduce((n, x) => n + x.itineraries.length, 0),
      comingSoon: countries.length === 0,
    };
  });
}
