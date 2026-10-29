import Link from "next/link";
import { Logo } from "./Logo";
import { LINKS, NAV, ROUTES, SITE } from "@/lib/site";

const linkClass = "text-sand-100 underline-offset-4 hover:text-white hover:underline";
const headingClass = "text-xs font-semibold uppercase tracking-[0.22em] text-sand-200";

export function Footer() {
  return (
    <footer id="contact" className="on-dark bg-forest-950 text-sand-100" aria-labelledby="footer-heading">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <h2 id="footer-heading" className="sr-only">
          Contact and site links
        </h2>
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
          <div>
            <Logo light />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-sand-200">
              {SITE.descriptor} near Khandoli Dam, Giridih, Jharkhand.
            </p>
          </div>

          <nav aria-label="Explore">
            <h3 className={headingClass}>Explore</h3>
            <ul className="mt-5 space-y-3 text-sm">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Enquiries">
            <h3 className={headingClass}>Enquire</h3>
            <ul className="mt-5 space-y-3 text-sm">
              <li><Link href={ROUTES.book} className={linkClass}>Room booking enquiry</Link></li>
              <li><Link href={ROUTES.eventEnquiry} className={linkClass}>Event enquiry</Link></li>
              <li><Link href={ROUTES.restaurant} className={linkClass}>Restaurant menu</Link></li>
            </ul>
          </nav>

          <address className="text-sm not-italic leading-relaxed">
            <h3 className={headingClass}>Find us</h3>
            <p className="mt-5">
              {SITE.address.lines.map((l) => (
                <span key={l} className="block">{l}</span>
              ))}
              <span className="block">PIN {SITE.address.postalCode}</span>
            </p>
            <ul className="mt-5 space-y-3">
              <li><a href={LINKS.tel} className={linkClass}>Call {SITE.phoneDisplay}</a></li>
              <li>
                <a href={LINKS.whatsapp} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  WhatsApp<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
              <li><a href={LINKS.mailto} className={`${linkClass} break-all`}>{SITE.email}</a></li>
              <li>
                <a href={LINKS.directions} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  Get directions<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            </ul>
          </address>
        </div>

        <p className="mt-14 border-t border-white/15 pt-6 text-xs text-sand-200">
          <Link href={ROUTES.privacy} className="underline underline-offset-4 hover:text-white">Privacy notice</Link>
          <span aria-hidden="true"> · </span>
          © {new Date().getFullYear()} {SITE.name}. Submitting an enquiry does not confirm a reservation; the resort
          will contact you to check availability.
        </p>
      </div>
    </footer>
  );
}
