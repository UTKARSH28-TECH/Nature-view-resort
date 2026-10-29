-- Room and event enquiries submitted through the website.
-- Applied by `npm run db:migrate` (scripts/migrate.mjs). Safe to run once; the runner records it in schema_migrations.

CREATE TABLE enquiries (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Shown to the guest and printed in the notification email, e.g. NVR-261029-K7QD2.
  reference        text NOT NULL UNIQUE,
  -- One id per form instance; a repeated send of the same form cannot create a second row.
  submission_id    text UNIQUE,
  -- Hash of the key fields; an identical enquiry within a short window is treated as a duplicate.
  fingerprint      text NOT NULL,
  kind             text NOT NULL CHECK (kind IN ('room', 'event')),
  -- Staff workflow. There is deliberately no "confirmed" value: confirming a booking is done outside this site.
  status           text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),

  guest_name       text NOT NULL,
  phone            text NOT NULL,
  email            text NOT NULL,
  -- All validated form fields (dates, room or event type, guests, requests...).
  payload          jsonb NOT NULL,

  -- Result of the notification email to the resort.
  email_status     text NOT NULL DEFAULT 'pending' CHECK (email_status IN ('pending', 'sent', 'failed', 'not-configured')),
  email_provider_id text,
  email_failure    text,
  email_attempted_at timestamptz
);

CREATE INDEX enquiries_created_at_idx ON enquiries (created_at DESC);
CREATE INDEX enquiries_fingerprint_idx ON enquiries (fingerprint, created_at DESC);
CREATE INDEX enquiries_status_idx ON enquiries (status, created_at DESC);
