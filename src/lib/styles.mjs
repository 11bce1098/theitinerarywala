/**
 * Travel styles — the second way into the library, alongside geography.
 *
 * Most people arriving at a travel site don't know which country they want.
 * They know they want a beach, or mountains, or somewhere the kids won't be
 * bored. Country pages can't answer that; these can.
 *
 * Five of the six are editorial judgements set per guide in frontmatter. The
 * sixth, `budget`, is deliberately NOT a tag: it is derived from what the trip
 * actually costs per day, so it cannot drift out of date when a budget is
 * revised or a currency moves.
 */

/** Trips under this much per person per day count as budget-friendly. */
export const BUDGET_USD_PER_DAY = 100;

/**
 * `feature` names the three countries shown on the homepage card. Left to
 * publish order it surfaced whatever happened to be newest — Austria for
 * mountains, when Switzerland and New Zealand were sitting right there. Any
 * country not in the library yet is skipped, so these can't go stale.
 */
export const STYLES = [
  {
    slug: 'beach',
    feature: ['Maldives', 'Seychelles', 'Thailand'],
    name: 'Beach escapes',
    icon: '🏖️',
    tagline: 'Sand, snorkelling and somewhere to do nothing.',
    blurb: `Trips built around the water rather than around a checklist — island
      hops, reef days and the kind of afternoon where the plan is a swim.`,
  },
  {
    slug: 'nature',
    feature: ['Switzerland', 'New Zealand', 'Nepal'],
    name: 'Mountains & nature',
    icon: '🏔️',
    tagline: 'Peaks, parks, deserts and the long views.',
    blurb: `For the trips where the landscape is the point: alpine valleys,
      safari plains, fiords, dunes and the roads that link them.`,
  },
  {
    slug: 'culture',
    feature: ['Japan', 'Egypt', 'Italy'],
    name: 'Culture & history',
    icon: '🏛️',
    tagline: 'Old cities, great museums, food worth travelling for.',
    blurb: `Ruins, palaces, markets and the cities that repay a slow walk —
      with the opening hours and ticket traps already worked out.`,
  },
  {
    slug: 'couples',
    feature: ['Greece', 'Maldives', 'Italy'],
    name: 'Couples & honeymoon',
    icon: '❤️',
    tagline: 'Slower days, better dinners, a view worth the detour.',
    blurb: `Routes that trade pace for atmosphere: fewer stops, longer
      evenings, and hotels chosen for the room rather than the location alone.`,
  },
  {
    slug: 'family',
    feature: ['UAE', 'Singapore', 'Australia'],
    name: 'Family travel',
    icon: '👨‍👩‍👧',
    tagline: 'Short hops, real breaks, nothing that needs queueing for an hour.',
    blurb: `Plans that survive contact with children — capped drives, a pool or
      a beach within reach, and honest notes on what is actually worth the ticket.`,
  },
  {
    slug: 'budget',
    feature: ['Vietnam', 'Uzbekistan', 'Sri Lanka'],
    name: 'Budget-friendly',
    icon: '🎒',
    tagline: `Great trips under $${BUDGET_USD_PER_DAY} a day.`,
    blurb: `Worked out from what each trip actually costs per person per day,
      not from a vague promise — so this list changes when the numbers do.`,
    derived: true,
  },
];

export const STYLE_SLUGS = STYLES.filter((s) => !s.derived).map((s) => s.slug);

export function styleBySlug(slug) {
  return STYLES.find((s) => s.slug === slug);
}

/**
 * Styles for one itinerary: its declared tags, plus `budget` when the numbers
 * earn it. `perDayUsd` comes from the caller because only it has live rates.
 */
export function stylesFor(itin, perDayUsd) {
  const declared = itin.data.styles ?? [];
  const all = [...declared];
  if (perDayUsd !== undefined && perDayUsd !== null && perDayUsd < BUDGET_USD_PER_DAY) {
    all.push('budget');
  }
  return all;
}

/** Groups itineraries under each style, dropping styles nothing matches yet. */
export function groupByStyle(itineraries, perDay) {
  return STYLES.map((style) => ({
    ...style,
    itineraries: itineraries.filter((itin) =>
      stylesFor(itin, perDay.get(itin.id)).includes(style.slug),
    ),
  })).filter((s) => s.itineraries.length > 0);
}
