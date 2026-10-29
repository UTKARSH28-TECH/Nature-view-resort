import type { EventTypeValue, VenueValue } from "./enquiries";
import { ROUTES } from "./site";

/**
 * Events content. Only things supported by the supplied photographs or the printed menu card
 * (which lists birthday, kitty, anniversary and marriage parties) appear here. No capacities, prices,
 * packages, catering, decoration or AV details until the resort confirms them (docs/EVENTS-TO-CONFIRM.md).
 */

export const enquiryHref = (opts: { type?: EventTypeValue; space?: VenueValue } = {}) => {
  const q = new URLSearchParams();
  if (opts.type) q.set("type", opts.type);
  if (opts.space) q.set("space", opts.space);
  const qs = q.toString();
  return qs ? `${ROUTES.eventEnquiry}?${qs}` : ROUTES.eventEnquiry;
};

export type EventPhoto = { src: string; alt: string };

export type Occasion = {
  id: string;
  title: string;
  eyebrow: string;
  text: string;
  type: EventTypeValue;
  photos: EventPhoto[];
};

export const OCCASIONS: Occasion[] = [
  {
    id: "weddings",
    eyebrow: "Weddings & receptions",
    title: "Marriage celebrations under open skies",
    text: "The resort hosts marriage parties. The open pavilion has a raised stage and space for seating, and the grounds are lit after dark. Share your date and guest count and we will discuss how the space can suit your plans.",
    type: "wedding",
    photos: [
      {
        src: "/images/events/stage-pavilion.webp",
        alt: "Open red-roofed pavilion with a raised stage, decorated tables and white chairs at night",
      },
      {
        src: "/images/resort/aerial-night.webp",
        alt: "Aerial night view of the resort grounds with lit pavilions and the entrance",
      },
    ],
  },
  {
    id: "birthdays",
    eyebrow: "Birthdays & anniversaries",
    title: "Private celebrations, set up your way",
    text: "Birthday and anniversary parties are listed on the restaurant's menu card. The photographs show a decorated birthday setup with a balloon wall and a neon sign. Tell us what you have in mind and we will talk through the arrangements.",
    type: "birthday",
    photos: [
      {
        src: "/images/events/birthday-setup.webp",
        alt: "Birthday decoration with a balloon wall, neon sign and panda-themed props",
      },
      {
        src: "/images/events/restaurant-hall-evening.webp",
        alt: "Covered hall with red drapes, a long table and a floral backdrop decorated for a party",
      },
    ],
  },
  {
    id: "family",
    eyebrow: "Engagements & family celebrations",
    title: "Family gatherings, big or small",
    text: "For engagements, get-togethers and other family occasions, the covered dining hall and the lawn are the spaces shown in our photographs. Tell us the occasion and the number of guests and we will help you plan.",
    type: "family-celebration",
    photos: [
      {
        src: "/images/events/long-table-hall.webp",
        alt: "Covered dining hall with a long wooden table, black chairs and string lights",
      },
      {
        src: "/images/resort/cottages-dusk.webp",
        alt: "Lawn with lit red-roofed pavilions at sunset",
      },
    ],
  },
];

export type Space = {
  id: VenueValue;
  name: string;
  summary: string;
  photo: EventPhoto;
};

/** Descriptive names based on the photographs; official hall and lawn names are unconfirmed. */
export const SPACES: Space[] = [
  {
    id: "open-pavilion",
    name: "Open pavilion with stage",
    summary: "A red-roofed open pavilion with a raised stage, shown set up with tables and chairs.",
    photo: {
      src: "/images/events/stage-pavilion.webp",
      alt: "Open red-roofed pavilion with a raised stage and white chairs at night",
    },
  },
  {
    id: "dining-hall",
    name: "Covered dining hall",
    summary: "A covered hall with a long table, drapes and string lights, also shown decorated for a party.",
    photo: {
      src: "/images/events/restaurant-hall-evening.webp",
      alt: "Covered dining hall with red drapes, a long table and a floral backdrop",
    },
  },
  {
    id: "lawn",
    name: "Lawn and grounds",
    summary: "Open lawn bordered by red-roofed pavilions, lit in the evening.",
    photo: {
      src: "/images/resort/cottages-dusk.webp",
      alt: "Lit red-roofed pavilions around a lawn at sunset",
    },
  },
];

export const PLANNING_CHECKLIST = [
  "The kind of event and the date you have in mind",
  "Roughly how many guests you expect",
  "Which space you prefer, if you know",
  "Any requirements for food, decoration or timing",
];
