import { Fragment } from "react";
import type { FooterContent } from "../../types/content";
import texture from "../../assets/texture.png";
import logoFooter from "../../assets/twohearts-logo-footer.svg";

interface FooterAskProps {
  content: FooterContent;
  showTexture: boolean;
}

/** Non-breaking-space middot separator, matching the template's &nbsp;·&nbsp;. */
const SEP = " · ";

export function FooterAsk({ content, showTexture }: FooterAskProps) {
  return (
    <footer
      style={{
        position: "relative",
        background: "var(--th-teal-dark)",
        color: "#fff",
        padding: "64px 0 44px",
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
          }}
        >
          {content.headline}
          <span style={{ fontWeight: 500, color: "#FF8296" }}>
            {content.headlineAccent}
          </span>
        </h2>
        <p
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,.72)",
            margin: "20px 0 0",
            lineHeight: 1.9,
          }}
        >
          {content.teamRows.map((row, r) => (
            <Fragment key={r}>
              {row.map((member, m) => (
                <Fragment key={m}>
                  <b style={{ color: "#fff" }}>{member.name}</b> {member.role}
                  {m < row.length - 1 ? SEP : null}
                </Fragment>
              ))}
              <br />
            </Fragment>
          ))}
          {content.contact}
        </p>
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 24,
            flexWrap: "wrap",
          }}
        >
          {content.links.map((link, i) => (
            <a
              key={i}
              href={link.href}
              className="th-ghost-link"
              style={{
                fontSize: 13,
                fontWeight: 700,
                border: "1.5px solid rgba(255,255,255,.35)",
                borderRadius: 999,
                padding: "10px 20px",
                color: "#fff",
                textDecoration: "none",
              }}
            >
              {link.label}
            </a>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 38,
          }}
        >
          <img
            src={logoFooter}
            alt={content.brandAlt}
            style={{ height: 20, display: "block", opacity: 0.9 }}
          />
          <span style={{ color: "rgba(255,255,255,.4)", fontSize: 13 }}>✕</span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 14,
              color: "rgba(255,255,255,.9)",
            }}
          >
            {content.kfcLabel}
          </span>
        </div>
        <p
          style={{
            margin: "16px 0 0",
            fontSize: 11.5,
            color: "rgba(255,255,255,.5)",
          }}
        >
          {content.disclaimer}
        </p>
      </div>
    </footer>
  );
}
