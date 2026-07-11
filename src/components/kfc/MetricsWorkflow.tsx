import type { MetricsWorkflowContent } from "../../types/content";

interface MetricsWorkflowProps {
  content: MetricsWorkflowContent;
  kfcRed: string;
}

export function MetricsWorkflow({ content, kfcRed }: MetricsWorkflowProps) {
  return (
    <section style={{ padding: "72px 0" }}>
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "0 24px",
          display: "grid",
          gridTemplateColumns: "1.3fr 1fr",
          gap: 16,
        }}
      >
        {/* Metrics card */}
        <div
          style={{
            background: "var(--surface-card)",
            border: "1px solid var(--th-line)",
            borderRadius: 18,
            padding: "26px 28px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: ".16em",
              textTransform: "uppercase",
              color: "var(--th-teal-dark)",
              marginBottom: 10,
            }}
          >
            {content.metricsTitle}
          </div>
          {content.metrics.map((metric, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 12,
                padding: "12px 0",
                borderBottom:
                  i < content.metrics.length - 1
                    ? "1px solid var(--th-line)"
                    : undefined,
              }}
            >
              <div
                style={{
                  flex: "none",
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "var(--th-green)",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 2,
                }}
              >
                ✓
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 14.5,
                  color: "var(--th-ink-2)",
                }}
              >
                <b style={{ color: "var(--th-ink)" }}>{metric.label}</b>
                {metric.body}
              </p>
            </div>
          ))}
        </div>

        {/* Workflow card */}
        <div
          style={{
            background: "var(--th-teal-lightest)",
            border: "1px solid var(--th-line)",
            borderRadius: 18,
            padding: "26px 28px",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: ".16em",
              textTransform: "uppercase",
              color: "var(--th-ink-3)",
              marginBottom: 10,
            }}
          >
            {content.workflowTitle}
          </div>
          <p style={{ margin: 0, fontSize: 14.5, color: "var(--th-ink)" }}>
            {content.workflowIntroPrefix}
            <b>{content.workflowIntroBold}</b>
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              margin: "14px 0 18px",
            }}
          >
            {content.workflowChips.map((chip, i) => (
              <span
                key={i}
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  background: "var(--th-teal-dark)",
                  color: "#fff",
                  borderRadius: 999,
                  padding: "4px 12px",
                }}
              >
                {chip}
              </span>
            ))}
          </div>
          {content.workflowNotes.map((note, i) => (
            <p
              key={i}
              style={{
                margin: i === 0 ? 0 : "12px 0 0",
                fontSize: 14,
                color: "var(--th-ink)",
              }}
            >
              <b style={{ color: kfcRed }}>{note.label}</b>
              {note.body}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
