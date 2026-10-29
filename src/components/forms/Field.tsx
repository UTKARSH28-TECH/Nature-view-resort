export const inputClass =
  "block h-12 w-full border bg-white px-3.5 text-base text-ink placeholder:text-ink-soft/60 disabled:opacity-60";

export const borderFor = (invalid: boolean) => (invalid ? "border-clay-700" : "border-forest-900/30");

export function Field({
  id,
  label,
  required,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-forest-950">
        {label}
        {required ? (
          <span className="text-clay-700" aria-hidden="true"> *</span>
        ) : (
          <span className="font-normal text-ink-soft"> (optional)</span>
        )}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-ink-soft">
          {hint}
        </p>
      )}
      <div className="mt-2">{children}</div>
      {error && (
        <p id={`${id}-error`} className="mt-2 flex gap-2 text-sm font-medium text-clay-700">
          <span aria-hidden="true">!</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

/** Hidden from people and assistive technology; bots tend to fill it. Read by name from the form element. */
export function Honeypot() {
  return (
    <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}
