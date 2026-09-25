/**
 * Guide topics. Kept alongside the schema enum in content.config.ts — adding
 * a topic means touching both, which is deliberate: a topic with no label,
 * icon or blurb would render as a bare slug.
 */
export const TOPICS = [
  {
    slug: 'visa',
    name: 'Visas & entry',
    blurb: 'What you need to get in, and where the official answer lives.',
    icon: 'M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM12 8a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5M9 17h6',
  },
  {
    slug: 'when-to-go',
    name: 'When to go',
    blurb: 'Seasons, weather and the weeks worth paying more for.',
    icon: 'M7 3v3M17 3v3M4 9h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z',
  },
  {
    slug: 'transport',
    name: 'Getting around',
    blurb: 'Trains, passes, rentals and what each actually costs.',
    icon: 'M8 3h8a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3ZM5 10h14M9 17l-2 4M15 17l2 4',
  },
  {
    slug: 'money',
    name: 'Money',
    blurb: 'Cards, cash, tipping and the fees nobody mentions.',
    icon: 'M3 7h18v10H3zM12 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4M6 10h.01M18 14h.01',
  },
  {
    slug: 'practical',
    name: 'Practical tips',
    blurb: 'The small things that change how a trip feels.',
    icon: 'M12 3v2M12 19v2M5 12H3M21 12h-2M6 6 4.5 4.5M19.5 19.5 18 18M6 18l-1.5 1.5M19.5 4.5 18 6M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z',
  },
];

export function topicBySlug(slug) {
  return TOPICS.find((t) => t.slug === slug);
}

/** Topics that actually have published guides, in declared order. */
export function topicsWithGuides(guides) {
  return TOPICS.map((topic) => ({
    ...topic,
    guides: guides.filter((g) => g.data.topic === topic.slug),
  })).filter((t) => t.guides.length > 0);
}
