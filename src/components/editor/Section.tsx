import { useState } from "react";
import type { ReactNode } from "react";

interface SectionProps {
  title: string;
  subtitle?: string;
  onReset: () => void;
  defaultOpen?: boolean;
  children: ReactNode;
}

// Collapsible content group. Each maps 1:1 to a top-level key of
// SiteContent and owns a "reset to defaults" affordance that restores
// only that key into the draft (it does not persist on its own).
export function Section({
  title,
  subtitle,
  onReset,
  defaultOpen = false,
  children,
}: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="ed-section">
      <div className="ed-section-head">
        <button
          type="button"
          className="ed-section-toggle"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="ed-section-caret" data-open={open}>
            ▸
          </span>
          <span className="ed-section-titles">
            <span className="ed-section-title">{title}</span>
            {subtitle ? (
              <span className="ed-section-subtitle">{subtitle}</span>
            ) : null}
          </span>
        </button>
        <button
          type="button"
          className="ed-btn ed-btn-ghost ed-btn-sm"
          onClick={onReset}
          title="Restore this section from bundled defaults (does not save)"
        >
          Reset section
        </button>
      </div>
      {open ? <div className="ed-section-body">{children}</div> : null}
    </section>
  );
}
