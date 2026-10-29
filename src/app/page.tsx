import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { HOME_DESCRIPTION, HOME_TITLE } from "@/lib/site";
import { pageMetadata, resortJsonLd } from "@/lib/seo";
import { ContactCta } from "@/components/home/ContactCta";
import { Events } from "@/components/home/Events";
import { Experiences } from "@/components/home/Experiences";
import { FeaturedRooms } from "@/components/home/FeaturedRooms";
import { GalleryPreview } from "@/components/home/GalleryPreview";
import { Hero } from "@/components/home/Hero";
import { Intro } from "@/components/home/Intro";
import { Khandoli } from "@/components/home/Khandoli";
import { Restaurant } from "@/components/home/Restaurant";

export const metadata: Metadata = pageMetadata({ title: HOME_TITLE, description: HOME_DESCRIPTION, path: "/", absoluteTitle: true });

export default function HomePage() {
  return (
    <>
      <JsonLd data={resortJsonLd()} />
      <Hero />
      <Intro />
      <FeaturedRooms />
      <Experiences />
      <Restaurant />
      <Events />
      <Khandoli />
      <GalleryPreview />
      <ContactCta />
    </>
  );
}
