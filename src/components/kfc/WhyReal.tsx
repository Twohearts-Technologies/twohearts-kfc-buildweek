import type { WhyRealContent } from "../../types/content";

interface WhyRealProps {
  content: WhyRealContent;
}

export function WhyReal({ content }: WhyRealProps) {
  return (
    <section style={{ padding: "72px 0" }}>
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
        <h2
          style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontWeight: 300,
            fontSize: "clamp(26px, 3.6vw, 42px)",
            lineHeight: 1.12,
            letterSpacing: "-.015em",
            color: "var(--th-ink)",
          }}
        >
          {content.headline}
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
            marginTop: 30,
          }}
        >
          {content.cards.map((card, i) => (
            <div
              key={i}
              style={
                card.highlighted
                  ? {
                      background: "var(--th-teal-lightest)",
                      border: "1.5px solid var(--th-teal)",
                      borderRadius: 18,
                      padding: "22px 24px",
                    }
                  : {
                      background: "var(--surface-card)",
                      border: "1px solid var(--th-line)",
                      borderRadius: 18,
                      padding: "22px 24px",
                      boxShadow: "var(--shadow-xs)",
                    }
              }
            >
              <h3
                style={
                  card.stat
                    ? {
                        margin: "0 0 6px",
                        fontFamily: "var(--font-display)",
                        fontSize: 24,
                        fontWeight: 500,
                        color: "var(--th-teal-dark)",
                      }
                    : {
                        margin: "0 0 6px",
                        fontSize: 16,
                        fontWeight: 700,
                      }
                }
              >
                {card.title}
              </h3>
              <p style={{ margin: 0, fontSize: 14, color: "var(--th-ink-2)" }}>
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
