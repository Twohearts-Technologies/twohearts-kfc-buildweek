import { useEffect, useRef, useState, type FormEvent } from "react";
import type { AccessGate } from "../../hooks/useAccessGate";

interface CodeGateModalProps {
  gate: AccessGate;
  accent: string;
  /** called once the code is accepted and the session may proceed */
  onUnlock: () => void;
}

export function CodeGateModal({ gate, accent, onUnlock }: CodeGateModalProps) {
  const [code, setCode] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") gate.setShowModal(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (code.length !== 6 || gate.verifying) return;
    const ok = await gate.verify(code);
    if (ok) {
      setCode("");
      onUnlock();
    } else {
      setCode("");
      inputRef.current?.focus();
    }
  }

  const ready = code.length === 6 && !gate.verifying;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Access code required"
      onClick={() => gate.setShowModal(false)}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "rgba(16, 37, 107, 0.55)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 400,
          background: "var(--surface-card)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-lg)",
          border: "1px solid var(--th-line)",
          padding: "28px 26px",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: ".14em",
            textTransform: "uppercase",
            color: "var(--th-teal-dark)",
            marginBottom: 10,
          }}
        >
          Restricted access
        </div>
        <h3
          style={{
            margin: "0 0 6px",
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: 22,
            color: "var(--th-ink)",
          }}
        >
          Enter your access code
        </h3>
        <p
          style={{ margin: "0 0 18px", fontSize: 14, color: "var(--th-ink-2)" }}
        >
          The live agent is private. Enter the 6-digit code to start a session.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="••••••"
            aria-label="6-digit access code"
            style={{
              width: "100%",
              boxSizing: "border-box",
              textAlign: "center",
              fontSize: 28,
              letterSpacing: ".4em",
              fontFamily: "var(--font-display)",
              padding: "14px 12px",
              borderRadius: "var(--radius-md)",
              border: "1.5px solid var(--th-line)",
              color: "var(--th-ink)",
              outline: "none",
            }}
          />
          {gate.error && (
            <div
              role="alert"
              style={{
                marginTop: 10,
                fontSize: 13,
                fontWeight: 600,
                color: "var(--color-danger)",
              }}
            >
              {gate.error}
            </div>
          )}
          <button
            type="submit"
            disabled={!ready}
            style={{
              marginTop: 16,
              width: "100%",
              padding: "13px",
              borderRadius: 999,
              border: 0,
              background: accent,
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              fontFamily: "inherit",
              cursor: ready ? "pointer" : "not-allowed",
              opacity: ready ? 1 : 0.6,
            }}
          >
            {gate.verifying ? "Checking…" : "Unlock the agent"}
          </button>
        </form>
        <button
          type="button"
          onClick={() => gate.setShowModal(false)}
          style={{
            marginTop: 12,
            width: "100%",
            background: "none",
            border: 0,
            color: "var(--th-ink-3)",
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
