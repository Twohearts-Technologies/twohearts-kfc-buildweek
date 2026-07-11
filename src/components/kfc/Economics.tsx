import type { EconomicsContent } from "../../types/content";

interface EconomicsProps {
  content: EconomicsContent;
  kfcRed: string;
}

export function Economics({ content, kfcRed }: EconomicsProps) {
  return (
    <section
      style={{
        padding: "72px 0",
        background: "var(--th-surface-sunken)",
        borderTop: "1px solid var(--th-line)",
        borderBottom: "1px solid var(--th-line)",
      }}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px" }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: ".16em",
            textTransform: "uppercase",
            color: "var(--th-teal-dark)",
            marginBottom: 14,
          }}
        >
          {content.eyebrow}
        </div>
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontWeight: 300,
            fontSize: "clamp(24px, 3.2vw, 34px)",
            lineHeight: 1.25,
            letterSpacing: "-.01em",
            maxWidth: 880,
            color: "var(--th-ink)",
          }}
        >
          {content.statement.map((seg, i) =>
            seg.accent ? (
              <span key={i} style={{ fontWeight: 500, color: kfcRed }}>
                {seg.text}
              </span>
            ) : (
              <span key={i}>{seg.text}</span>
            ),
          )}
        </p>
        <div
          style={{
            display: "flex",
            gap: 14,
            flexWrap: "wrap",
            marginTop: 28,
          }}
        >
          {content.cards.map((card, i) => (
            <div
              key={i}
              style={{
                background: "var(--surface-card)",
                border: "1px solid var(--th-line)",
                borderRadius: 18,
                padding: "18px 22px",
                flex: 1,
                minWidth: 220,
                boxShadow: "var(--shadow-xs)",
              }}
            >
              <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>
                {card.label}
              </h4>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--th-ink-2)",
                  margin: "5px 0 0",
                }}
              >
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
