/**
 * Single source of truth for business details, routes and navigation.
 * Update contact information here only.
 */
export const SITE = {
  name: "Nature View Resort",
  shortName: "Nature View",
  descriptor: "Resort & Family Restaurant",
  tagline: "Where Nature Meets Unforgettable Moments",
  phoneDisplay: "+91 87899 05694",
  phoneTel: "+918789905694",
  whatsappNumber: "918789905694",
  email: "natureviewresort1@gmail.com",
  address: {
    lines: [
      "Near Khandoli Dam, Sonbad Road",
      "Near Khandoli Park",
      "Giridih, Jharkhand",
    ],
    postalCode: "815302",
    country: "India",
  },
} as const;

const addressOneLine = `${SITE.address.lines.join(", ")} ${SITE.address.postalCode}, ${SITE.address.country}`;

export const whatsappWith = (message: string) => `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;

export const LINKS = {
  tel: `tel:${SITE.phoneTel}`,
  mailto: `mailto:${SITE.email}`,
  whatsapp: `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent("Hello Nature View Resort, I would like to enquire about a stay.")}`,
  directions: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Nature View Resort, ${addressOneLine}`)}`,
  addressOneLine,
};

/**
 * Planned routes. Only "/" exists after Phase 2; the others are built in later phases
 * (see docs/ROUTES.md). Keep paths here so pages can be added without touching components.
 */
export const ROUTES = {
  home: "/",
  rooms: "/rooms",
  restaurant: "/restaurant",
  events: "/events",
  khandoli: "/khandoli",
  gallery: "/gallery",
  contact: "/contact",
  book: "/book",
  eventEnquiry: "/events/enquiry",
} as const;

/** Pages whose first screen is a full-bleed photo, so the header starts transparent. Add new hero pages here. */
export const hasHeroImage = (pathname: string) => pathname === "/" || pathname === "/rooms" || pathname.startsWith("/rooms/") || pathname === "/restaurant" || pathname === "/events" || pathname === "/khandoli";

export const NAV = [
  { label: "Rooms", href: ROUTES.rooms },
  { label: "Restaurant & Menu", href: ROUTES.restaurant },
  { label: "Gallery", href: ROUTES.gallery },
  { label: "Events", href: ROUTES.events },
  { label: "Discover Khandoli", href: ROUTES.khandoli },
  { label: "Contact", href: ROUTES.contact },
] as const;

export const ROOMS = [
  {
    slug: "deluxe-room-with-lake-view",
    name: "Deluxe Room with Lake View",
    summary: "A deluxe room with a bed and a balcony.",
    image: "/images/rooms/deluxe-room.webp",
    alt: "Deluxe room with a double bed, warm lighting and a balcony door",
  },
  {
    slug: "deluxe-twin-room-with-balcony-hill-and-lake-view",
    name: "Deluxe Twin Room with Balcony, Hill and Lake View",
    summary: "Twin beds and a balcony facing the hill and lake side.",
    image: "/images/rooms/twin-room.webp",
    alt: "Deluxe twin room with two beds and a large window looking out to a hill",
  },
  {
    slug: "executive-suite-with-private-balcony",
    name: "Executive Suite with Private Balcony",
    summary: "A suite with a seating area and its own private balcony.",
    image: "/images/rooms/suite-room.webp",
    alt: "Executive suite with a bed, leather sofa and balcony windows",
  },
] as const;
