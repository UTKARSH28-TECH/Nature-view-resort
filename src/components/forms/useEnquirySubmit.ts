"use client";

import { useCallback, useRef, useState } from "react";
import { submitEnquiry, type EnquiryKind, type SubmitOutcome } from "@/lib/submit-enquiry";

export type Outcome<V> =
  | { type: "sent"; reference?: string; saved: boolean; values: V }
  | { type: "saved"; reference?: string; values: V }
  | {
      type: "problem";
      problem: Exclude<SubmitOutcome["status"], "sent" | "saved" | "invalid">;
      reference?: string;
      retryAfterSeconds?: number;
      values: V;
    };

/**
 * Owns the loading / success / problem states of an enquiry form.
 * - A ref guard blocks double submits immediately, before React re-renders.
 * - One submissionId per form lets the server ignore a repeated send of the same successful enquiry.
 */
export function useEnquirySubmit<V extends object>(kind: EnquiryKind) {
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<Outcome<V> | null>(null);
  const busyRef = useRef(false);
  const idRef = useRef<string>("");

  const submit = useCallback(
    async (values: V, honeypot: string): Promise<{ errors?: Record<string, string> }> => {
      if (busyRef.current) return {};
      busyRef.current = true;
      setBusy(true);
      if (!idRef.current) idRef.current = crypto.randomUUID();
      try {
        const r = await submitEnquiry(kind, values, { submissionId: idRef.current, honeypot });
        if (r.status === "invalid") return { errors: r.errors };
        if (r.status === "sent") setOutcome({ type: "sent", reference: r.reference, saved: r.saved, values });
        else if (r.status === "saved") setOutcome({ type: "saved", reference: r.reference, values });
        else
          setOutcome({
            type: "problem",
            problem: r.status,
            reference: "reference" in r ? r.reference : undefined,
            retryAfterSeconds: r.status === "rate-limited" ? r.retryAfterSeconds : undefined,
            values,
          });
        return {};
      } finally {
        busyRef.current = false;
        setBusy(false);
      }
    },
    [kind],
  );

  return { busy, outcome, submit, clearOutcome: () => setOutcome(null) };
}
