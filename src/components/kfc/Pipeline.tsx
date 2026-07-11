import type { PipelineContent } from "../../types/content";
import mark from "../../assets/twohearts-mark.svg";

interface PipelineProps {
  content: PipelineContent;
  kfcRed: string;
}

export function Pipeline({ content, kfcRed }: PipelineProps) {
  return (
    <section style={{ padding: "72px 0", background: "var(--th-surface-sunken)" }}>
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

        <div className="th-pipeline-grid">
          {/* Two inputs */}
          <div
            style={{
              background: "var(--surface-card)",
              border: "1px solid var(--th-line)",
              borderRadius: 14,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              boxShadow: "var(--shadow-xs)",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: ".12em",
                color: "var(--th-ink-3)",
              }}
            >
              {content.inputsLabel}
            </div>
            {content.inputs.map((input, i) => (
              <div
                key={i}
                style={{
                  borderLeft: `3px solid ${
                    input.tone === "red" ? kfcRed : "var(--th-teal)"
                  }`,
                  paddingLeft: 9,
                  marginTop: 8,
                }}
              >
                <b style={{ fontSize: 13.5 }}>{input.title}</b>
                <small
                  style={{
                    display: "block",
                    fontSize: 11,
                    color: "var(--th-ink-3)",
                  }}
                >
                  {input.detail}
                </small>
              </div>
            ))}
          </div>

          <div className="th-pipeline-arrow">→</div>

          {/* Agent */}
          <div
            style={{
              background: "var(--th-teal-lightest)",
              border: "1.5px solid var(--th-teal)",
              borderRadius: 14,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <img
              src={mark}
              alt={content.agentCard.logoAlt}
              style={{ height: 20, width: "auto", alignSelf: "flex-start" }}
            />
            <h4
              style={{
                margin: 0,
                fontSize: 14.5,
                fontWeight: 700,
                color: "var(--th-teal-dark)",
              }}
            >
              {content.agentCard.title}
            </h4>
            <small style={{ fontSize: 12, color: "var(--th-ink-3)" }}>
              {content.agentCard.subtitle}
            </small>
          </div>

          <div className="th-pipeline-arrow">→</div>

          {/* Actions */}
          <div
            style={{
              background: "var(--surface-card)",
              border: "1px solid var(--th-line)",
              borderRadius: 14,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              boxShadow: "var(--shadow-xs)",
            }}
          >
            <h4
              style={{
                margin: 0,
                fontSize: 11,
                letterSpacing: ".08em",
                color: "var(--th-ink-3)",
                fontWeight: 700,
              }}
            >
              {content.actionsLabel}
            </h4>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 5,
                marginTop: 10,
              }}
            >
              {content.actionChips.map((chip, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    background: kfcRed,
                    color: "#fff",
                    borderRadius: 999,
                    padding: "4px 12px",
                  }}
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <div className="th-pipeline-arrow">→</div>

          {/* Output */}
          <div
            style={{
              background: "var(--surface-card)",
              border: "1px solid var(--th-line)",
              borderRadius: 14,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              boxShadow: "var(--shadow-xs)",
            }}
          >
            <h4 style={{ margin: 0, fontSize: 14.5, fontWeight: 700 }}>
              {content.outputCard.title}
            </h4>
            <small
              style={{
                fontSize: 12,
                color: "var(--th-ink-3)",
                marginTop: 3,
              }}
            >
              {content.outputCard.subtitle}
            </small>
          </div>
        </div>

        <p
          style={{
            margin: "18px 0 0",
            fontSize: 13.5,
            fontStyle: "italic",
            color: "var(--th-ink-3)",
          }}
        >
          <b style={{ color: "var(--th-ink)", fontStyle: "normal" }}>
            {content.footnote.label}
          </b>
          {content.footnote.body}
        </p>
      </div>
    </section>
  );
}
