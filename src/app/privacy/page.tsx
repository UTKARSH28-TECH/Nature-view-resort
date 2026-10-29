import type { Metadata } from "next";
import Link from "next/link";
import { LINKS, ROUTES, SITE } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Notice",
  description:
    "How Nature View Resort, Khandoli, Giridih uses the details you send in a room or event enquiry: what is collected, why, who handles it and how it is protected.",
  path: ROUTES.privacy,
});

/** Marks a point that needs a decision from the resort's management before launch (see docs/PRIVACY-TO-CONFIRM.md). */
function ToConfirm({ children }: { children: React.ReactNode }) {
  return (
    <span className="mt-3 block border-l-4 border-clay-600 bg-sand-100 px-4 py-3 text-sm text-ink">
      <strong className="font-semibold text-clay-700">To be confirmed by the resort:</strong> {children}
    </span>
  );
}

const h2 = "mt-12 font-display text-2xl text-forest-950 sm:text-3xl";
const p = "mt-3 text-base leading-relaxed text-ink-soft";
const li = "mt-2 flex gap-3 text-base leading-relaxed text-ink-soft";
const bullet = <span aria-hidden="true" className="mt-3 h-px w-4 shrink-0 bg-clay-600" />;

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-32 sm:px-8 sm:pt-36">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay-600">Privacy</p>
      <h1 className="mt-3 font-display text-4xl leading-[1.08] text-forest-950 sm:text-5xl">Privacy Notice</h1>
      <p className="mt-5 text-base leading-relaxed text-ink-soft sm:text-lg">
        This notice explains what happens to the details you send through the room enquiry and event enquiry forms on
        this website. It is a plain-language summary of how the website works.
      </p>
      <p className="mt-4 border border-forest-900/15 bg-sand-100 px-4 py-3 text-sm text-ink">
        <strong>Draft.</strong> Points marked &ldquo;To be confirmed by the resort&rdquo; are management decisions that
        have not been made yet. They are not promises.
      </p>

      <h2 className={h2}>Who is responsible</h2>
      <p className={p}>
        {SITE.name}, {SITE.address.lines.join(", ")}, {SITE.address.postalCode}. You can reach the resort on{" "}
        <a href={LINKS.tel} className="underline decoration-clay-600 underline-offset-4">{SITE.phoneDisplay}</a> or at{" "}
        <a href={LINKS.mailto} className="break-all underline decoration-clay-600 underline-offset-4">{SITE.email}</a>.
        <ToConfirm>the legal name of the business that is responsible for this data, and a named contact for privacy requests.</ToConfirm>
      </p>

      <h2 className={h2}>What we collect</h2>
      <p className={p}>Only what you type into the form:</p>
      <ul className="mt-2">
        <li className={li}>{bullet}<span><strong className="text-forest-950">Room enquiry:</strong> your name, phone number, email address, preferred room, check-in and check-out dates, number of adults and children, and any special requests you write.</span></li>
        <li className={li}>{bullet}<span><strong className="text-forest-950">Event enquiry:</strong> your name, phone number, email address, type of event, preferred date (or that it is not fixed), approximate number of guests, preferred space, and any requirements you write.</span></li>
      </ul>
      <p className={p}>
        We do not ask for payment card numbers, identity documents or health information, and there is no online
        payment. Please do not put them in the free-text boxes.
      </p>
      <p className={p}>
        <strong className="text-forest-950">Technical data.</strong> To stop spam, your IP address is checked briefly
        in the server&rsquo;s memory to limit repeated submissions; it is not saved with your enquiry. The website
        currently uses no analytics, advertising or tracking cookies. Our hosting provider may keep standard technical
        server logs.
      </p>

      <h2 className={h2}>Why we collect it and how we use it</h2>
      <p className={p}>
        To reply to your enquiry: to check availability, discuss arrangements and prices, and contact you by phone,
        WhatsApp or email. The website does not send marketing messages and does not sell your details.
        <ToConfirm>whether the resort will use enquiry details for anything else, such as marketing, and if so how people can opt out.</ToConfirm>
      </p>

      <h2 className={h2}>Who handles it</h2>
      <ul className="mt-2">
        <li className={li}>{bullet}<span><strong className="text-forest-950">The resort&rsquo;s staff</strong>, who receive your enquiry by email at the address above.</span></li>
        <li className={li}>{bullet}<span><strong className="text-forest-950">An email delivery service (Resend)</strong>, which sends the notification email to the resort on the website&rsquo;s behalf.</span></li>
        <li className={li}>{bullet}<span><strong className="text-forest-950">A database provider</strong>, if the resort&rsquo;s enquiry database is connected. In that case a copy of your enquiry is stored there so it is not lost. After you send a form, the page tells you whether a copy was saved.</span></li>
        <li className={li}>{bullet}<span><strong className="text-forest-950">The website host</strong>, which runs the website.</span></li>
        <li className={li}>{bullet}<span><strong className="text-forest-950">WhatsApp or your email app</strong>, only if you choose those buttons to send your details yourself; they work under their own terms.</span></li>
      </ul>
      <p className={p}>
        These services act for the resort. <ToConfirm>which countries or regions the email and database providers use, and the final list of providers.</ToConfirm>
      </p>

      <h2 className={h2}>How long we keep it</h2>
      <p className={p}>
        The resort has not yet decided how long enquiries are kept. Until it does, enquiries stay in the resort&rsquo;s
        email and (where connected) database until the resort deletes them.
        <ToConfirm>a retention period (for example, how many months after an enquiry is closed it is deleted).</ToConfirm>
      </p>

      <h2 className={h2}>Your choices</h2>
      <p className={p}>
        You can contact the resort to ask what it holds about your enquiry, to correct it or to ask for it to be
        deleted, using the phone number or email above.
        <ToConfirm>that the resort will handle such requests, who handles them, and how quickly.</ToConfirm>
      </p>

      <h2 className={h2}>How it is protected</h2>
      <ul className="mt-2">
        <li className={li}>{bullet}<span>Email and database credentials are kept on the server only, never in the web pages sent to your browser.</span></li>
        <li className={li}>{bullet}<span>Your enquiry is checked on the server before it is used, and guest text is escaped before it appears in the notification email.</span></li>
        <li className={li}>{bullet}<span>There is no public page or address that lists enquiries. Stored enquiries can only be read by people who hold the database login.</span></li>
        <li className={li}>{bullet}<span>Error messages shown on the site never include other people&rsquo;s details.</span></li>
      </ul>
      <p className={p}>
        No online system is perfectly secure. If you prefer, call the resort instead of using the form.
      </p>

      <h2 className={h2}>Changes</h2>
      <p className={p}>
        If this notice changes, the new version will replace it on this page.
        <ToConfirm>a review date and a way to show when the notice was last updated.</ToConfirm>
      </p>

      <p className="mt-12 text-sm text-ink-soft">
        Back to <Link href={ROUTES.contact} className="underline decoration-clay-600 underline-offset-4">contact</Link> or{" "}
        <Link href={ROUTES.home} className="underline decoration-clay-600 underline-offset-4">the homepage</Link>.
      </p>
    </div>
  );
}
