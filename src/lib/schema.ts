/**
 * JSON-LD builders.
 *
 * Search engines can read the pages without this, but structured data is what
 * makes them eligible for rich results — the FAQ accordions, breadcrumb trails
 * and article bylines that take up more of the results page than a plain blue
 * link. Every guide already ends in an FAQ section, so that one is close to
 * free.
 */

const SITE_URL = 'https://theitinerarywala.com';

function abs(path: string): string {
  return new URL(path, SITE_URL).href;
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbs(items: Crumb[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: abs(c.path),
    })),
  };
}

/**
 * Pulls Q&A pairs out of a rendered FAQ section.
 *
 * Authors write them as `**Question?** Answer`, which markdown renders as a
 * paragraph opening with <strong>. Anything not in that shape is skipped
 * rather than guessed at — a malformed entry should drop out of the schema,
 * not produce a question with no answer.
 */
export function faqFromHtml(html: string) {
  const pairs: { question: string; answer: string }[] = [];
  const para = /<p>\s*<strong>([\s\S]*?)<\/strong>([\s\S]*?)<\/p>/gi;

  for (const match of html.matchAll(para)) {
    const question = stripTags(match[1]);
    const answer = stripTags(match[2]);
    if (!question.endsWith('?') || answer.length < 20) continue;
    pairs.push({ question, answer });
  }

  if (pairs.length === 0) return null;
  return {
    '@type': 'FAQPage',
    mainEntity: pairs.map((p) => ({
      '@type': 'Question',
      name: p.question,
      acceptedAnswer: { '@type': 'Answer', text: p.answer },
    })),
  };
}

interface GuideInput {
  title: string;
  description: string;
  path: string;
  image?: string;
  published: Date;
  updated?: Date;
  country: string;
  days: number;
}

export function guideArticle(g: GuideInput) {
  return {
    '@type': 'Article',
    headline: g.title.slice(0, 110), // Google truncates beyond ~110
    description: g.description,
    image: g.image ? abs(g.image) : abs('/images/og-card.jpg'),
    datePublished: g.published.toISOString(),
    dateModified: (g.updated ?? g.published).toISOString(),
    author: { '@type': 'Organization', name: 'The Itinerary Wala', url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'The Itinerary Wala',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: abs('/images/og-card.jpg') },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': abs(g.path) },
    about: { '@type': 'Place', name: g.country },
    keywords: [`${g.country} itinerary`, `${g.days} days in ${g.country}`, 'travel itinerary'],
  };
}

export function itemList(name: string, items: { name: string; path: string }[]) {
  return {
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      url: abs(it.path),
    })),
  };
}

export function website() {
  return {
    '@type': 'WebSite',
    name: 'The Itinerary Wala',
    url: SITE_URL,
    description:
      'Day-by-day travel itineraries with realistic pacing, budgets in real numbers, and every stay and tour bookable in one tap.',
    publisher: { '@type': 'Organization', name: 'The Itinerary Wala', url: SITE_URL },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/itineraries/?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}
