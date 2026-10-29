import { Button } from "@/components/Button";
import { Photo } from "@/components/Photo";
import { SectionHeading } from "@/components/SectionHeading";
import { ROUTES } from "@/lib/site";

// Taken from the printed menu card. Do not add categories that are not on the menu.
const CATEGORIES = [
  "Veg & non-veg starters",
  "Tandoor",
  "Noodles & chopsuey",
  "Main course",
  "Dal, roti & naan",
  "Rice & biryani",
  "Soups & salads",
  "Breakfast & beverages",
];

export function Restaurant() {
  return (
    <section id="restaurant" aria-labelledby="restaurant-heading" className="on-dark bg-forest-950 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <div className="grid grid-cols-5 gap-4">
            <Photo
              src="/images/events/long-table-hall.webp"
              alt="Covered dining hall with a long wooden table, black chairs and warm string lights"
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="col-span-5 aspect-[16/10]"
            />
            <Photo
              src="/images/food/kadhai-paneer.webp"
              alt="Paneer curry in a white bowl with rice, papad and sliced onion"
              sizes="(min-width: 1024px) 20vw, 50vw"
              className="col-span-3 aspect-[4/5]"
            />
            <Photo
              src="/images/food/noodles.webp"
              alt="A bowl of vegetable noodles lifted with a fork"
              sizes="(min-width: 1024px) 15vw, 40vw"
              className="col-span-2 aspect-[4/5]"
            />
          </div>

          <div>
            <SectionHeading eyebrow="Family Restaurant" title="Dine at Nature View" id="restaurant-heading" light>
              A vegetarian and non-vegetarian menu covering starters, tandoor, Chinese, main course, breads, rice and
              biryani. Browse the full menu with prices.
            </SectionHeading>
            <ul className="mt-8 flex flex-wrap gap-2" aria-label="Menu categories">
              {CATEGORIES.map((c) => (
                <li key={c} className="border border-white/25 px-3 py-1.5 text-sm text-sand-100">
                  {c}
                </li>
              ))}
            </ul>
            <Button href={`${ROUTES.restaurant}#menu`} className="mt-10">
              View the Menu
            </Button>
            <p className="mt-6 text-xs leading-relaxed text-sand-200">
              Food photographs are shown for illustration and may not depict dishes prepared at the resort.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
