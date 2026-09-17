/**
 * Splits an itinerary's rendered HTML into the three bands the page shows:
 * an overview, the day-by-day tabs, and trailing reference sections.
 *
 * Authors keep writing plain markdown — a `## Day N — ...` heading starts a
 * tab, any other `##` before the days joins the overview, and any after them
 * becomes a trailing section (costs, booking notes, and so on).
 */
export interface Section {
  /** Heading id, reused for tab/panel wiring and deep links. */
  id: string;
  /** Full heading text, e.g. "Day 3 — Drive to Kazbegi". */
  heading: string;
  /** Short label for the tab button, e.g. "Day 3". */
  label: string;
  /** Section HTML, heading included. */
  html: string;
}

export interface SplitItinerary {
  intro: string;
  days: Section[];
  extras: Section[];
}

const H2 = /<h2\b([^>]*)>([\s\S]*?)<\/h2>/gi;

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

function decode(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * "Day 3 — Drive to Kazbegi" -> "Day 3", and "Days 9–13 — ..." -> "Days 9–13".
 * Anything else falls back to the part before the dash.
 */
function shortLabel(heading: string): string {
  const day = heading.match(/^Days?\s+\d+(?:\s*[–—-]\s*\d+)?/i);
  if (day) return day[0];
  return heading.split(/\s+[—–-]\s+/)[0];
}

/**
 * Splits a block of rendered HTML at its H3s.
 *
 * Used for the overview, where the subsections (visas, money, SIM…) are
 * independent enough to tab rather than scroll through.
 */
export function splitByH3(html: string): { lead: string; sections: Section[] } {
  const H3 = /<h3\b([^>]*)>([\s\S]*?)<\/h3>/gi;
  const marks: { start: number; attrs: string; heading: string }[] = [];

  H3.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = H3.exec(html)) !== null) {
    marks.push({ start: match.index, attrs: match[1], heading: decode(stripTags(match[2])) });
  }

  if (marks.length < 2) return { lead: html, sections: [] };

  const sections: Section[] = marks.map((mark, i) => {
    const end = i + 1 < marks.length ? marks[i + 1].start : html.length;
    const idMatch = mark.attrs.match(/\bid=["']([^"']+)["']/);
    return {
      id: idMatch ? idMatch[1] : slugify(mark.heading),
      heading: mark.heading,
      label: shortLabel(mark.heading),
      html: html.slice(mark.start, end),
    };
  });

  return { lead: html.slice(0, marks[0].start), sections };
}

export function splitItinerary(html: string): SplitItinerary {
  const marks: { start: number; attrs: string; heading: string }[] = [];

  H2.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = H2.exec(html)) !== null) {
    marks.push({
      start: match.index,
      attrs: match[1],
      heading: decode(stripTags(match[2])),
    });
  }

  if (marks.length === 0) {
    return { intro: html, days: [], extras: [] };
  }

  const sections: Section[] = marks.map((mark, i) => {
    const end = i + 1 < marks.length ? marks[i + 1].start : html.length;
    const idMatch = mark.attrs.match(/\bid=["']([^"']+)["']/);
    return {
      id: idMatch ? idMatch[1] : slugify(mark.heading),
      heading: mark.heading,
      label: shortLabel(mark.heading),
      html: html.slice(mark.start, end),
    };
  });

  // Accepts a range too: a multi-day leg is still part of the itinerary.
  const isDay = (section: Section) => /^Days?\s+\d+/i.test(section.heading);
  const firstDay = sections.findIndex(isDay);
  const lastDay = sections.map(isDay).lastIndexOf(true);

  // No day headings at all: treat the whole thing as one long read.
  if (firstDay === -1) {
    return { intro: html, days: [], extras: [] };
  }

  return {
    intro: html.slice(0, marks[0].start) + sections.slice(0, firstDay).map((s) => s.html).join(''),
    days: sections.slice(firstDay, lastDay + 1).filter(isDay),
    // Anything non-day sitting between days stays with the trailing group.
    extras: sections.slice(firstDay).filter((s) => !isDay(s)),
  };
}
