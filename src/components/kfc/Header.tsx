import type { HeaderContent } from "../../types/content";
import logo from "../../assets/twohearts-logo.svg";

interface HeaderProps {
  content: HeaderContent;
  kfcRed: string;
}

export function Header({ content, kfcRed }: HeaderProps) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(255,255,255,.94)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--th-line)",
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 66,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img
            src={logo}
            alt={content.brandAlt}
            style={{ height: 26, display: "block" }}
          />
          <span
            style={{ color: "var(--th-ink-3)", fontWeight: 400, fontSize: 15 }}
          >
            ✕
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 17,
              color: kfcRed,
              letterSpacing: "-.01em",
            }}
          >
            {content.kfcLabel}
          </span>
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: ".1em",
            textTransform: "uppercase",
            color: "var(--th-ink-3)",
          }}
        >
          {content.eventLabel}
        </div>
      </div>
    </header>
  );
}
