import { useCallback, useEffect, useState } from "react";

// Client side of the Worker access gate. The 6-digit code is validated
// server-side by the Worker (worker.ts); this hook only asks whether the
// caller is unlocked and submits a code to be checked. The code is never
// stored or compared here.
export interface AccessGate {
  /** true once the Worker confirms an unlocked session (valid gate cookie). */
  unlocked: boolean;
  /** initial status check in flight */
  checking: boolean;
  /** a verify() request is in flight */
  verifying: boolean;
  error: string | null;
  showModal: boolean;
  setShowModal: (v: boolean) => void;
  /** submit a code to the Worker; resolves true on success */
  verify: (code: string) => Promise<boolean>;
}

export function useAccessGate(): AccessGate {
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/gate/status", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("status"))))
      .then((d: unknown) => {
        if (cancelled) return;
        setUnlocked(
          typeof d === "object" &&
            d !== null &&
            (d as { unlocked?: unknown }).unlocked === true,
        );
      })
      .catch(() => {
        // No Worker in this environment (e.g. `vite dev`) or a transient
        // error — fail open so local development isn't blocked. In production
        // the Worker always answers, so the gate is enforced there.
        if (!cancelled) setUnlocked(true);
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const verify = useCallback(async (code: string) => {
    setVerifying(true);
    setError(null);
    try {
      const r = await fetch("/api/gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code }),
      });
      if (r.ok) {
        setUnlocked(true);
        return true;
      }
      setError(
        r.status === 401
          ? "Incorrect code. Please try again."
          : `Verification failed (${r.status}).`,
      );
      return false;
    } catch {
      setError("Network error. Please try again.");
      return false;
    } finally {
      setVerifying(false);
    }
  }, []);

  return {
    unlocked,
    checking,
    verifying,
    error,
    showModal,
    setShowModal,
    verify,
  };
}
