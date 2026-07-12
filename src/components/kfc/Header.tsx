import type { HeaderContent } from "../../types/content";
import kfcLogo from "../../assets/kfc-logo-image.png";
import logo from "../../assets/twohearts-logo.svg";

interface HeaderProps {
  content: HeaderContent;
  kfcRed: string;
}

export function Header({ content, kfcRed }: HeaderProps) {
  const kfcRegionLabel = content.kfcLabel.replace(/^KFC\s*/i, "").trim();

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
            style={{ display: "inline-flex", alignItems: "center", gap: 7 }}
          >
            <img
              src={kfcLogo}
              alt="KFC"
              style={{ height: 42, width: "auto", display: "block" }}
            />
            {kfcRegionLabel && (
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 17,
                  color: kfcRed,
                  letterSpacing: "-.01em",
                }}
              >
                {kfcRegionLabel}
              </span>
            )}
          </span>
        </div>
        <div
          className="th-event-label"
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
