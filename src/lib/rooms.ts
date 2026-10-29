import { ROOMS, ROUTES } from "./site";

/**
 * Room content. Everything here is limited to what the supplied photographs show or the
 * resort has confirmed. Prices, occupancy, bed sizes, room sizes and availability are
 * intentionally absent until verified (see docs/ROOMS-TO-CONFIRM.md).
 */

export type RoomSlug = (typeof ROOMS)[number]["slug"];

export type RoomPhoto = {
  src: string;
  alt: string;
  caption: string;
  /** Portrait photos are letterboxed in the large viewer instead of cropped. */
  portrait?: boolean;
};

export type RoomDetail = (typeof ROOMS)[number] & {
  intro: string;
  description: string[];
  /** Things visible in the photographs; not a verified amenity list. */
  seenInPhotos: string[];
  gallery: RoomPhoto[];
  metaDescription: string;
};

const P = "/images/rooms";

const DETAILS: Record<RoomSlug, Omit<RoomDetail, keyof (typeof ROOMS)[number]>> = {
  "deluxe-room-with-lake-view": {
    intro: "A deluxe room with warm wood panelling, soft lighting and a balcony.",
    description: [
      "The Deluxe Room with Lake View is finished in warm wood and neutral tones, with an upholstered headboard, curtains and gentle lighting around the bed.",
      "A glass-railed balcony looks out over open land and water, as shown in the photographs.",
    ],
    seenInPhotos: [
      "Bed with upholstered headboard and bedside tables",
      "Wall-mounted air conditioner",
      "Balcony with a glass railing",
      "Bathroom with a shower, wash basin and water heater",
    ],
    gallery: [
      { src: `${P}/deluxe-room.webp`, alt: "Deluxe room with a bed, warm lighting, curtains and a balcony door", caption: "The room" },
      { src: `${P}/deluxe-bed.webp`, alt: "Bed with an upholstered headboard, bedside table and wall-mounted air conditioner", caption: "Bed and bedside" },
      { src: `${P}/deluxe-balcony.webp`, alt: "Glass-railed balcony looking over scrubland, trees and a stretch of water", caption: "Balcony view" },
      { src: `${P}/deluxe-bathroom.webp`, alt: "Bathroom with a black marble wall, wash basin, shower and water heater", caption: "Bathroom", portrait: true },
    ],
    metaDescription:
      "The Deluxe Room with Lake View at Nature View Resort, Khandoli, Giridih: photographs and a booking enquiry link.",
  },
  "deluxe-twin-room-with-balcony-hill-and-lake-view": {
    intro: "Twin beds, a large window and a balcony facing the hill and lake side.",
    description: [
      "The Deluxe Twin Room with Balcony, Hill and Lake View has two beds with upholstered headboards and a large window that frames the hillside.",
      "The balcony has a glass railing, and the photographs show the rocky hill and a lake in the distance.",
    ],
    seenInPhotos: [
      "Two beds with upholstered headboards",
      "Large window with curtains",
      "Balcony with a glass railing",
      "Bathroom with a backlit mirror, wash basin, shower and water heater",
    ],
    gallery: [
      { src: `${P}/twin-room.webp`, alt: "Twin room with two beds and a large window looking out to a green hill", caption: "The room" },
      { src: `${P}/twin-balcony.webp`, alt: "Glass-railed balcony with a view of a rocky green hill and a lake", caption: "Balcony, hill and lake" },
      { src: `${P}/twin-bathroom.webp`, alt: "Bathroom with a black marble wall, counter basin, backlit mirror and water heater", caption: "Bathroom" },
    ],
    metaDescription:
      "The Deluxe Twin Room with Balcony, Hill and Lake View at Nature View Resort, Khandoli, Giridih: photographs and a booking enquiry link.",
  },
  "executive-suite-with-private-balcony": {
    intro: "A suite with a bed, a seating area and its own private balcony.",
    description: [
      "The Executive Suite with Private Balcony combines a bed with a separate seating area, including a leather sofa and coffee table, in a bright room with large windows.",
      "The private balcony has a glass railing and, in the photographs, a view across green land to water.",
    ],
    seenInPhotos: [
      "Bed and a seating area with a leather sofa and coffee table",
      "Wall-mounted television",
      "Wall-mounted air conditioner and ceiling fan",
      "Private balcony with a glass railing",
      "Bathroom with a wash basin and water heater",
    ],
    gallery: [
      { src: `${P}/suite-room.webp`, alt: "Suite with a bed, leather sofa seating area, coffee table and large windows", caption: "The suite" },
      { src: `${P}/suite-tv-wall.webp`, alt: "Suite wall with a mounted television, air conditioner and balcony glass door", caption: "Television wall" },
      { src: `${P}/suite-balcony.webp`, alt: "Private balcony with a glass railing and a view over green land to a lake", caption: "Private balcony", portrait: true },
      { src: `${P}/suite-bathroom.webp`, alt: "Bathroom with a black marble wall, wash basin and water heater", caption: "Bathroom", portrait: true },
    ],
    metaDescription:
      "The Executive Suite with Private Balcony at Nature View Resort, Khandoli, Giridih: photographs and a booking enquiry link.",
  },
};

export const ROOM_LIST: RoomDetail[] = ROOMS.map((r) => ({ ...r, ...DETAILS[r.slug] }));

export function getRoom(slug: string): RoomDetail | undefined {
  return ROOM_LIST.find((r) => r.slug === slug);
}

export const roomHref = (slug: RoomSlug) => `${ROUTES.rooms}/${slug}`;
export const bookRoomHref = (slug: RoomSlug) => `${ROUTES.book}?room=${slug}`;

export const ROOM_PHOTO_NOTE =
  "Photographs show a representative room of this category. Bed arrangements, furnishings and views can differ between rooms; the resort will confirm details when you enquire.";
