import type { HeroContent } from "../../types/content";

interface HeroProps {
  content: HeroContent;
  kfcRed: string;
}

export function Hero({ content, kfcRed }: HeroProps) {
  return (
    <section style={{ background: "var(--th-teal-lightest)", padding: "92px 0 76px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px" }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: ".16em",
            textTransform: "uppercase",
            color: "var(--th-teal-dark)",
            marginBottom: 18,
          }}
        >
          {content.eyebrow}
        </div>
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontWeight: 300,
            fontSize: "clamp(36px, 5.2vw, 62px)",
            lineHeight: 1.08,
            letterSpacing: "-.02em",
            maxWidth: 920,
            color: "var(--th-ink)",
          }}
        >
          {content.headline}
          <span style={{ fontWeight: 500, color: kfcRed }}>
            {content.headlineAccent}
          </span>
        </h1>
        <p
          style={{
            fontSize: 18,
            color: "var(--th-ink-2)",
            maxWidth: 760,
            margin: "22px 0 0",
          }}
        >
          {content.subheadPrefix}
          <b>{content.subheadBold}</b>
          {content.subheadRest}
        </p>
        <div
          style={{
            display: "flex",
            gap: 14,
            marginTop: 32,
            flexWrap: "wrap",
          }}
        >
          <a
            href="#demo"
            className="th-cta-primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontWeight: 700,
              fontSize: 15,
              borderRadius: 999,
              padding: "14px 28px",
              textDecoration: "none",
              background: kfcRed,
              color: "#fff",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            {content.ctaPrimary}
          </a>
          <a
            href="#"
            className="th-cta-secondary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              fontWeight: 700,
              fontSize: 15,
              borderRadius: 999,
              padding: "14px 28px",
              textDecoration: "none",
              border: "1.5px solid var(--th-teal)",
              color: "var(--th-teal-dark)",
            }}
          >
            {content.ctaSecondary}
          </a>
        </div>
        <div
          style={{
            marginTop: 26,
            fontSize: 13,
            color: "var(--th-ink-3)",
            fontWeight: 600,
          }}
        >
          {content.footnote}
        </div>
      </div>
    </section>
  );
}
