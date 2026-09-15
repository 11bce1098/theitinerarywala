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
  Armenia:    { continent: 'asia',   region: 'Caucasus' },
  Georgia:    { continent: 'asia',   region: 'Caucasus' },
  Japan:      { continent: 'asia',   region: 'East Asia' },
  UAE:        { continent: 'asia',   region: 'Middle East' },
  Uzbekistan: { continent: 'asia',   region: 'Central Asia' },
  Russia:     { continent: 'europe', region: 'Eastern Europe' },
};

export const CONTINENTS = [
  { slug: 'asia',    name: 'Asia',          blurb: 'Short flights from the UAE, and where most visa-free options are.' },
  { slug: 'europe',  name: 'Europe',        blurb: 'Longer flights, more paperwork, and worth the planning.' },
  { slug: 'africa',  name: 'Africa',        blurb: 'Close on the map, and quick to reach from the Gulf.' },
  { slug: 'americas',name: 'The Americas',  blurb: 'Long-haul trips that need real lead time.' },
  { slug: 'oceania', name: 'Oceania',       blurb: 'The furthest, and the most planning.' },
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

export function regionFor(country) {
  return COUNTRIES[country]?.region ?? '';
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

  return CONTINENTS.filter((c) => byContinent.has(c.slug)).map((c) => {
    const countries = [...byContinent.get(c.slug).entries()]
      .map(([name, items]) => ({
        name,
        region: regionFor(name),
        itineraries: items.sort(
          (a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf()
        ),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      ...c,
      countries,
      itineraryCount: countries.reduce((n, x) => n + x.itineraries.length, 0),
    };
  });
}
