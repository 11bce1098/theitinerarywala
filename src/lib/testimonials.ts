/**
 * Reader quotes for the homepage.
 *
 * Only publish wording the person actually approved. The earlier entries here
 * were drafted while building the site rather than written by travellers, so
 * they were removed; these came from readers who used the itineraries.
 *
 * `href` points at the itinerary the quote is about, where one exists — it
 * turns a nice sentence into something the reader can act on. Leave it off
 * when the trip has no guide yet rather than linking somewhere approximate.
 */
export const SHOW = true;
export const PLACEHOLDER = false;

export interface Testimonial {
  quote: string;
  name: string;
  /** Where they went, as they described it. */
  trip: string;
  /** Out of five. */
  rating: number;
  /** The itinerary it refers to, if the site has one. */
  href?: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'The Malaysia itinerary from The Itinerary Wala was really useful. The ' +
      'day-by-day plan made it easy to understand where to go, what to see and ' +
      'how to manage our time. It saved us a lot of research and made planning ' +
      'the trip much easier. Highly recommended!',
    name: 'Mrigank',
    trip: 'Malaysia',
    rating: 5,
    href: '/itineraries/malaysia-10-days-guide/',
  },
  {
    quote:
      'Planning our Langkawi trip was so much easier with The Itinerary Wala. ' +
      'I loved that the itinerary was simple, practical and focused on the ' +
      'places and experiences actually worth doing. The travel tips and ' +
      'suggested schedule were really helpful.',
    name: 'Tanay',
    trip: 'Langkawi',
    rating: 5,
    href: '/itineraries/malaysia-10-days-guide/',
  },
  {
    quote:
      'The Bali itinerary was exactly what we needed for our trip. There are so ' +
      'many places to visit in Bali that it can get confusing, but the itinerary ' +
      'helped us organise everything properly. The recommendations and day-wise ' +
      'planning made the trip much more enjoyable.',
    name: 'Anand',
    trip: 'Bali',
    rating: 5,
    href: '/itineraries/indonesia-bali-guide/',
  },
  {
    quote:
      'Really liked the Dubai itinerary from The Itinerary Wala. It helped us ' +
      'plan the major attractions without making the trip feel rushed. The ' +
      'suggestions were practical and the overall itinerary was easy to follow. ' +
      'Great resource for anyone planning a Dubai trip.',
    name: 'Bishwa',
    trip: 'Dubai',
    rating: 5,
    href: '/itineraries/uae-7-days-guide/',
  },
  {
    quote:
      'The Vietnam itinerary was very well organised and saved us a lot of time ' +
      'while planning. I especially liked the day-by-day structure and the ' +
      'practical travel tips. It gave us a clear idea of what we could cover ' +
      'during the trip without overplanning.',
    name: 'Prasoon',
    trip: 'Vietnam',
    rating: 5,
    href: '/itineraries/vietnam-10-days-guide/',
  },
  {
    // No Uttarakhand itinerary on the site yet, so this one carries no link.
    quote:
      'We used The Itinerary Wala to plan our Rishikesh, Dehradun and Mussoorie ' +
      'trip and it made the whole process much easier. The route was well ' +
      'planned and the suggestions for places to visit were very useful. A great ' +
      'option if you want a well-organised trip without spending hours researching.',
    name: 'Juhi',
    trip: 'Rishikesh, Dehradun & Mussoorie',
    rating: 5,
  },
];
