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
  {
    slug: 'asia',
    name: 'Asia',
    blurb: 'Enormous variety, and often the shortest flights to get there.',
    regions: ['Middle East', 'Caucasus', 'Central Asia', 'South Asia', 'Southeast Asia', 'East Asia'],
  },
  {
    slug: 'europe',
    name: 'Europe',
    blurb: 'Longer flights, more paperwork, and worth the planning.',
    regions: ['Western Europe', 'Southern Europe', 'Central Europe', 'Northern Europe', 'Eastern Europe'],
  },
  {
    slug: 'africa',
    name: 'Africa',
    blurb: 'Closer than it looks, and easier to reach than most expect.',
    regions: ['North Africa', 'West Africa', 'East Africa', 'Southern Africa', 'Indian Ocean Islands'],
  },
  {
    slug: 'north-america',
    name: 'North America',
    blurb: 'Long-haul trips that need real lead time.',
    regions: ['Canada', 'United States', 'Mexico and Central America', 'The Caribbean'],
  },
  {
    slug: 'south-america',
    name: 'South America',
    blurb: 'The longest flights, and the ones worth the most planning.',
    regions: ['The Andes', 'Brazil', 'Southern Cone'],
  },
  {
    slug: 'oceania',
    name: 'Oceania',
    blurb: 'Far, expensive, and unlike anywhere else on this list.',
    regions: ['Australia', 'New Zealand', 'Pacific Islands'],
  },
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

/** Catches a typo'd or misfiled region at build time rather than in the menu. */
function assertRegionsDeclared() {
  for (const [country, entry] of Object.entries(COUNTRIES)) {
    const continent = CONTINENTS.find((c) => c.slug === entry.continent);
    if (!continent) {
      throw new Error(`"${country}" is in continent "${entry.continent}", which is not declared.`);
    }
    if (!continent.regions.includes(entry.region)) {
      throw new Error(
        `"${country}" is in region "${entry.region}", which ${continent.name} does not declare. ` +
          `Declared: ${continent.regions.join(', ')}`
      );
    }
  }
}
assertRegionsDeclared();

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

    // Regions come from the continent's declared list, not from whatever
    // countries happen to exist — so an empty continent still shows its
    // subdivisions, each marked as coming soon.
    const regions = c.regions.map((name) => {
      const inRegion = countries.filter((x) => x.region === name);
      return {
        name,
        slug: regionSlug(name),
        countries: inRegion,
        comingSoon: inRegion.length === 0,
      };
    });

    return {
      ...c,
      countries,
      regions,
      itineraryCount: countries.reduce((n, x) => n + x.itineraries.length, 0),
      comingSoon: countries.length === 0,
    };
  });
}
