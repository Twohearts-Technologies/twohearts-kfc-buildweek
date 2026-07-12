import type { DemoContent, TagTone } from "../../types/content";
import texture from "../../assets/texture.png";

interface DemoVideoProps {
  content: DemoContent;
  kfcRed: string;
  showTexture: boolean;
}

function toneColor(tone: TagTone, kfcRed: string): string {
  if (tone === "red") return kfcRed;
  if (tone === "ink") return "var(--th-ink)";
  return "var(--th-teal-dark)";
}

function badgeColor(tone: TagTone, kfcRed: string): string {
  if (tone === "red") return kfcRed;
  if (tone === "ink") return "var(--th-ink)";
  return "var(--th-teal)";
}

export function DemoVideo({ content, kfcRed, showTexture }: DemoVideoProps) {
  return (
    <section id="demo" style={{ padding: "72px 0" }}>
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
        <p
          style={{
            fontSize: 17,
            color: "var(--th-ink-2)",
            maxWidth: 820,
            margin: "14px 0 0",
          }}
        >
          {content.subheadline}
        </p>

        <div style={{ marginTop: 32 }}>
          <div
            style={{
              position: "relative",
              aspectRatio: "16/9",
              background: "var(--th-teal-dark)",
              borderRadius: 18,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            {showTexture && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `url("${texture}")`,
                  opacity: 0.12,
                  pointerEvents: "none",
                }}
              />
            )}
            {content.videoEmbedUrl ? (
              <iframe
                src={content.videoEmbedUrl}
                title={content.videoTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  border: 0,
                }}
              />
            ) : (
              <div
                style={{
                  position: "relative",
                  color: "rgba(255,255,255,.65)",
                  textAlign: "center",
                  padding: 24,
                  fontSize: 13,
                }}
              >
                <div
                  style={{
                    width: 74,
                    height: 74,
                    borderRadius: "50%",
                    background: kfcRed,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                    color: "#fff",
                    fontSize: 26,
                    boxShadow: "var(--shadow-md)",
                  }}
                >
                  ▶
                </div>
                <strong
                  style={{
                    color: "#fff",
                    display: "block",
                    fontSize: 17,
                    marginBottom: 6,
                    fontFamily: "var(--font-display)",
                    fontWeight: 500,
                  }}
                >
                  {content.videoTitle}
                </strong>
                {content.videoCaption}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            marginTop: 28,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {content.steps.map((step, i) => (
            <div
              key={i}
              style={{
                background: "var(--surface-card)",
                border: "1px solid var(--th-line)",
                borderRadius: 18,
                padding: "20px 22px",
                boxShadow: "var(--shadow-xs)",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: badgeColor(step.tagTone, kfcRed),
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                {i + 1}
              </div>
              <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
                {step.title}
              </h4>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--th-ink-2)",
                  margin: "5px 0 0",
                }}
              >
                {step.body}
              </p>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  marginTop: 10,
                  display: "inline-block",
                  color: toneColor(step.tagTone, kfcRed),
                }}
              >
                {step.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
