import type { ProblemContent } from "../../types/content";
import texture from "../../assets/texture.png";

interface ProblemSectionProps {
  content: ProblemContent;
  showTexture: boolean;
}

export function ProblemSection({ content, showTexture }: ProblemSectionProps) {
  return (
    <section
      style={{
        position: "relative",
        background: "var(--th-teal-dark)",
        color: "#fff",
        padding: "72px 0",
        overflow: "hidden",
      }}
    >
      {showTexture && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url("${texture}")`,
            opacity: 0.1,
            pointerEvents: "none",
          }}
        />
      )}
      <div
        style={{
          position: "relative",
          maxWidth: 1080,
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: ".16em",
            textTransform: "uppercase",
            color: "var(--th-teal-light)",
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
            color: "#fff",
            maxWidth: 860,
          }}
        >
          {content.headline}
        </h2>
        <p
          style={{
            fontSize: 17,
            color: "rgba(255,255,255,.72)",
            maxWidth: 820,
            margin: "14px 0 0",
          }}
        >
          {content.subheadline}
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
            marginTop: 32,
          }}
        >
          {content.stats.map((stat, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,.06)",
                border: "1px solid rgba(255,255,255,.14)",
                borderRadius: 18,
                padding: "22px 24px",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 38,
                  fontWeight: 300,
                  color: "var(--th-teal-light)",
                }}
              >
                {stat.value}
              </div>
              <p
                style={{
                  fontSize: 13.5,
                  color: "rgba(255,255,255,.72)",
                  margin: "6px 0 0",
                }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
