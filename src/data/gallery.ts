/**
 * Gallery photographs. Only approved images from public/images (optimized copies of the supplied files).
 * `kitty party` and `winter -1` are not included until consent is confirmed. Khandoli landscapes are kept in their
 * own group because they were not necessarily taken on the resort property.
 * Width and height are the pixel sizes of the optimized files, so each tile reserves its space before loading.
 */

export type GalleryGroupId = "resort" | "rooms" | "restaurant" | "events" | "khandoli";

export const GALLERY_GROUPS: { id: GalleryGroupId; label: string; note?: string }[] = [
  { id: "resort", label: "Resort & grounds" },
  { id: "rooms", label: "Rooms & suites" },
  { id: "restaurant", label: "Restaurant & food", note: "Food photographs are illustrative and may not show dishes exactly as served." },
  { id: "events", label: "Weddings & events" },
  {
    id: "khandoli",
    label: "Khandoli landscapes",
    note: "Scenery of the Khandoli area. These views are not necessarily visible from the resort.",
  },
];

export type GalleryPhoto = {
  id: string;
  group: GalleryGroupId;
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
};

const R = "/images";

export const GALLERY: GalleryPhoto[] = [
  // Resort & grounds
  { id: "resort-hill", group: "resort", src: `${R}/hero/resort-and-hill.webp`, width: 1672, height: 941, alt: "Red-roofed resort buildings and a green lawn in front of a rocky hill under a blue sky", caption: "The resort and the hill behind it" },
  { id: "resort-aerial-dusk", group: "resort", src: `${R}/resort/aerial-dusk.webp`, width: 1448, height: 1086, alt: "Aerial view of Nature View Resort at dusk with the main building, pavilions and restaurant signage", caption: "Aerial view at dusk" },
  { id: "resort-aerial-night", group: "resort", src: `${R}/resort/aerial-night.webp`, width: 1672, height: 941, alt: "Aerial night view of the resort grounds with lit pavilions and the entrance", caption: "The grounds at night" },
  { id: "resort-lawn-dusk", group: "resort", src: `${R}/resort/cottages-dusk.webp`, width: 1672, height: 941, alt: "Lit red-roofed pavilions around a lawn at sunset", caption: "Lawn and pavilions at sunset" },

  // Rooms & suites
  { id: "deluxe-room", group: "rooms", src: `${R}/rooms/deluxe-room.webp`, width: 1448, height: 1086, alt: "Deluxe room with a bed, warm lighting, curtains and a balcony door", caption: "Deluxe Room with Lake View" },
  { id: "deluxe-bed", group: "rooms", src: `${R}/rooms/deluxe-bed.webp`, width: 1448, height: 1086, alt: "Bed with an upholstered headboard, bedside table and wall-mounted air conditioner", caption: "Deluxe Room: bed" },
  { id: "deluxe-balcony", group: "rooms", src: `${R}/rooms/deluxe-balcony.webp`, width: 1567, height: 1004, alt: "Glass-railed balcony looking over scrubland, trees and a stretch of water", caption: "Deluxe Room: balcony" },
  { id: "deluxe-bathroom", group: "rooms", src: `${R}/rooms/deluxe-bathroom.webp`, width: 1122, height: 1402, alt: "Bathroom with a black marble wall, wash basin, shower and water heater", caption: "Deluxe Room: bathroom" },
  { id: "twin-room", group: "rooms", src: `${R}/rooms/twin-room.webp`, width: 1533, height: 1026, alt: "Twin room with two beds and a large window looking out to a green hill", caption: "Deluxe Twin Room with Balcony, Hill and Lake View" },
  { id: "twin-balcony", group: "rooms", src: `${R}/rooms/twin-balcony.webp`, width: 1536, height: 1024, alt: "Glass-railed balcony with a view of a rocky green hill and a lake", caption: "Twin Room: balcony" },
  { id: "twin-bathroom", group: "rooms", src: `${R}/rooms/twin-bathroom.webp`, width: 1672, height: 941, alt: "Bathroom with a black marble wall, counter basin, backlit mirror and water heater", caption: "Twin Room: bathroom" },
  { id: "suite-room", group: "rooms", src: `${R}/rooms/suite-room.webp`, width: 1254, height: 1254, alt: "Suite with a bed, leather sofa seating area, coffee table and large windows", caption: "Executive Suite with Private Balcony" },
  { id: "suite-tv", group: "rooms", src: `${R}/rooms/suite-tv-wall.webp`, width: 1254, height: 1254, alt: "Suite wall with a mounted television, air conditioner and balcony glass door", caption: "Suite: television wall" },
  { id: "suite-balcony", group: "rooms", src: `${R}/rooms/suite-balcony.webp`, width: 1092, height: 1440, alt: "Private balcony with a glass railing and a view over green land to a lake", caption: "Suite: private balcony" },
  { id: "suite-bathroom", group: "rooms", src: `${R}/rooms/suite-bathroom.webp`, width: 1122, height: 1402, alt: "Bathroom with a black marble wall, wash basin and water heater", caption: "Suite: bathroom" },

  // Restaurant & food
  { id: "dining-hall", group: "restaurant", src: `${R}/events/restaurant-hall-evening.webp`, width: 1672, height: 941, alt: "Covered dining hall with red drapes, a long wooden table and a floral backdrop in the evening", caption: "Covered dining hall" },
  { id: "food-kadhai", group: "restaurant", src: `${R}/food/kadhai-paneer.webp`, width: 1100, height: 1430, alt: "Paneer curry in a white bowl with rice, papad and sliced onion", caption: "Paneer curry (illustrative)" },
  { id: "food-noodles", group: "restaurant", src: `${R}/food/noodles.webp`, width: 1100, height: 1430, alt: "A bowl of vegetable noodles lifted with a fork", caption: "Noodles (illustrative)" },
  { id: "food-dosa", group: "restaurant", src: `${R}/food/dosa.webp`, width: 1448, height: 1086, alt: "A dosa on a banana leaf with sambar and chutney", caption: "Dosa (illustrative)" },
  { id: "food-gulab", group: "restaurant", src: `${R}/food/gulab-jamun.webp`, width: 1120, height: 1405, alt: "A tray of gulab jamun", caption: "Gulab jamun (illustrative)" },

  // Weddings & events
  { id: "event-pavilion", group: "events", src: `${R}/events/stage-pavilion.webp`, width: 1597, height: 985, alt: "Open red-roofed pavilion with a raised stage, decorated tables and white chairs at night", caption: "Open pavilion with stage" },
  { id: "event-birthday", group: "events", src: `${R}/events/birthday-setup.webp`, width: 1672, height: 941, alt: "Birthday decoration with a balloon wall, neon sign and panda-themed props", caption: "Birthday setup" },
  { id: "event-hall", group: "events", src: `${R}/events/long-table-hall.webp`, width: 1596, height: 986, alt: "Covered hall with a long wooden table, black chairs and string lights", caption: "Hall set with a long table" },

  // Khandoli landscapes
  { id: "kh-sunset", group: "khandoli", src: `${R}/khandoli/hill-sunset.webp`, width: 1672, height: 941, alt: "A rocky hill silhouetted against a setting sun, reflected in a reservoir", caption: "Hill and water at sunset" },
  { id: "kh-park", group: "khandoli", src: `${R}/khandoli/hill-and-park.webp`, width: 1671, height: 941, alt: "A rocky hill above a landscaped park with pine trees and a footpath", caption: "Hill above a landscaped park" },
  { id: "kh-boating", group: "khandoli", src: `${R}/khandoli/boating.webp`, width: 1461, height: 1076, alt: "Small pedal boats on the blue water of a reservoir", caption: "Boating on the reservoir" },
  { id: "kh-jetty", group: "khandoli", src: `${R}/khandoli/lake-and-jetty.webp`, width: 1284, height: 1225, alt: "Reservoir with a jetty, trees and a road in the foreground", caption: "Reservoir and jetty" },
  { id: "kh-geese", group: "khandoli", src: `${R}/khandoli/birds-on-water.webp`, width: 1438, height: 1094, alt: "A group of geese swimming on the water", caption: "Geese on the water (a seasonal sight; not guaranteed)" },
];

export const groupLabel = (id: GalleryGroupId) => GALLERY_GROUPS.find((g) => g.id === id)?.label ?? id;
