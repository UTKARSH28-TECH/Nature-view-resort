import { ContactCta } from "@/components/home/ContactCta";
import { Events } from "@/components/home/Events";
import { Experiences } from "@/components/home/Experiences";
import { FeaturedRooms } from "@/components/home/FeaturedRooms";
import { GalleryPreview } from "@/components/home/GalleryPreview";
import { Hero } from "@/components/home/Hero";
import { Intro } from "@/components/home/Intro";
import { Khandoli } from "@/components/home/Khandoli";
import { Restaurant } from "@/components/home/Restaurant";

export default function HomePage() {
  return (
    <>
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
