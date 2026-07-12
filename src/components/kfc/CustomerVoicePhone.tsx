import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import mark from "../../assets/twohearts-mark.svg";
import thinkingMotionAsset from "../../assets/twohearts-thinking-motion.svg";
import {
  startCustomerVoiceSession,
  type CustomerVoiceMode,
  type CustomerVoiceSessionHandle,
} from "../../services/customerVoiceSession";

type CustomerCallStatus =
  | "idle"
  | "starting"
  | "active"
  | "ending"
  | "ended"
  | "error";
type ThinkingMotionPhase = "settled" | "entering" | "visible" | "leaving";

const THINKING_MOTION_ENTER_MS = 40;
const THINKING_MOTION_FADE_MS = 320;

interface CustomerVoicePhoneProps {
  kfcRed: string;
}

function getStatusText(
  status: CustomerCallStatus,
  mode: CustomerVoiceMode,
): string {
  if (status === "starting") return "Connecting to KFC";
  if (status === "ending") return "Ending call";
  if (status === "ended") return "Call ended";
  if (status === "error") return "Could not start call";
  if (status === "active") {
    if (mode === "listening") return "Listening";
    if (mode === "speaking") return "Speaking";
    if (mode === "thinking") return "Thinking";
    return "Connected";
  }

  return "KFC voice agent";
}

function getButtonLabel(status: CustomerCallStatus): string {
  if (status === "starting") return "Connecting";
  if (status === "active") return "End call";
  if (status === "ending") return "Ending";
  if (status === "error") return "Try again";
  if (status === "ended") return "Start again";
  return "Start call";
}

function normalizePhoneInput(raw: string): string {
  // Keep digits + leading + only. Vietnamese phones: 0XXXXXXXXX or +84XXXXXXXXX.
  const trimmed = raw.replace(/[^\d+]/g, "");
  if (trimmed.startsWith("+84") && trimmed.length >= 12) return trimmed;
  if (trimmed.startsWith("84") && trimmed.length >= 11) return `+${trimmed}`;
  if (trimmed.startsWith("0") && trimmed.length >= 10) return trimmed;
  return trimmed;
}

function isPhoneValid(phone: string): boolean {
  // Accepts 0XXXXXXXXX (10 digits) or +84XXXXXXXXX (11 digits after +84).
  return /^0\d{9}$/.test(phone) || /^\+84\d{9}$/.test(phone);
}

export function CustomerVoicePhone({ kfcRed }: CustomerVoicePhoneProps) {
  const [status, setStatus] = useState<CustomerCallStatus>("idle");
  const [mode, setMode] = useState<CustomerVoiceMode>("connecting");
  const [error, setError] = useState<string | null>(null);
  const [phoneInput, setPhoneInput] = useState<string>("");
  const [thinkingMotionState, setThinkingMotion] = useState<{
    phase: ThinkingMotionPhase;
    renderKey: number;
  }>({ phase: "settled", renderKey: 0 });
  const sessionRef = useRef<CustomerVoiceSessionHandle | null>(null);
  const startAbortRef = useRef<AbortController | null>(null);
  const sessionRequestIdRef = useRef(0);
  const thinkingMotionRef = useRef(thinkingMotionState);
  const enterMotionTimerRef = useRef<number | null>(null);
  const exitMotionTimerRef = useRef<number | null>(null);
  const queuedMotionRestartRef = useRef(false);

  const setThinkingMotionState = useCallback(
    (
      updater:
        | { phase: ThinkingMotionPhase; renderKey: number }
        | ((current: { phase: ThinkingMotionPhase; renderKey: number }) => {
            phase: ThinkingMotionPhase;
            renderKey: number;
          }),
    ) => {
      setThinkingMotion((current) => {
        const next = typeof updater === "function" ? updater(current) : updater;
        thinkingMotionRef.current = next;
        return next;
      });
    },
    [],
  );

  const clearEnterMotionTimer = useCallback(() => {
    if (enterMotionTimerRef.current === null) return;
    window.clearTimeout(enterMotionTimerRef.current);
    enterMotionTimerRef.current = null;
  }, []);

  const clearExitMotionTimer = useCallback(() => {
    if (exitMotionTimerRef.current === null) return;
    window.clearTimeout(exitMotionTimerRef.current);
    exitMotionTimerRef.current = null;
  }, []);

  const startFreshThinkingMotion = useCallback(() => {
    clearEnterMotionTimer();
    clearExitMotionTimer();
    queuedMotionRestartRef.current = false;
    setThinkingMotionState((current) => ({
      phase: "entering",
      renderKey: current.renderKey + 1,
    }));

    enterMotionTimerRef.current = window.setTimeout(() => {
      enterMotionTimerRef.current = null;
      setThinkingMotionState((current) =>
        current.phase === "entering"
          ? { ...current, phase: "visible" }
          : current,
      );
    }, THINKING_MOTION_ENTER_MS);
  }, [clearEnterMotionTimer, clearExitMotionTimer, setThinkingMotionState]);

  const fadeOutThinkingMotion = useCallback(() => {
    clearEnterMotionTimer();
    const { phase } = thinkingMotionRef.current;
    if (phase === "settled" || phase === "leaving") return;

    queuedMotionRestartRef.current = false;
    setThinkingMotionState((current) => ({ ...current, phase: "leaving" }));
    clearExitMotionTimer();
    exitMotionTimerRef.current = window.setTimeout(() => {
      exitMotionTimerRef.current = null;
      if (queuedMotionRestartRef.current) {
        startFreshThinkingMotion();
        return;
      }

      setThinkingMotionState((current) =>
        current.phase === "leaving"
          ? { ...current, phase: "settled" }
          : current,
      );
    }, THINKING_MOTION_FADE_MS);
  }, [
    clearEnterMotionTimer,
    clearExitMotionTimer,
    setThinkingMotionState,
    startFreshThinkingMotion,
  ]);

  const endSession = useCallback(
    async (nextStatus: CustomerCallStatus = "ended") => {
      startAbortRef.current?.abort();
      startAbortRef.current = null;
      const requestId = sessionRequestIdRef.current + 1;
      sessionRequestIdRef.current = requestId;

      const session = sessionRef.current;
      if (!session) {
        setStatus(nextStatus === "idle" ? "idle" : "ended");
        setMode("connecting");
        if (nextStatus === "idle") setError(null);
        return;
      }

      sessionRef.current = null;
      setStatus("ending");
      setError(null);

      try {
        await session.end();
        if (sessionRequestIdRef.current !== requestId) return;
        setStatus(nextStatus);
        setMode("connecting");
      } catch (endError) {
        if (sessionRequestIdRef.current !== requestId) return;
        setStatus("error");
        setError(
          endError instanceof Error
            ? endError.message
            : "Failed to end voice session",
        );
      }
    },
    [],
  );

  const startSession = useCallback(async () => {
    if (
      sessionRef.current ||
      startAbortRef.current ||
      status === "starting" ||
      status === "ending"
    ) {
      return;
    }

    const abortController = new AbortController();
    const requestId = sessionRequestIdRef.current + 1;
    startAbortRef.current = abortController;
    sessionRequestIdRef.current = requestId;
    setStatus("starting");
    setMode("connecting");
    setError(null);

    try {
      const trimmedPhone = normalizePhoneInput(phoneInput);
      const session = await startCustomerVoiceSession({
        signal: abortController.signal,
        callerPhone: isPhoneValid(trimmedPhone) ? trimmedPhone : undefined,
        onModeChange: (nextMode) => {
          if (
            sessionRequestIdRef.current === requestId &&
            !abortController.signal.aborted
          ) {
            setMode(nextMode);
          }
        },
        onError: (message) => {
          if (sessionRequestIdRef.current !== requestId) return;

          sessionRequestIdRef.current += 1;
          abortController.abort();
          startAbortRef.current = null;
          const activeSession = sessionRef.current;
          sessionRef.current = null;
          setError(message);
          setStatus("error");
          setMode("connecting");
          void activeSession?.end();
        },
      });

      if (
        abortController.signal.aborted ||
        sessionRequestIdRef.current !== requestId
      ) {
        await session.end().catch(() => undefined);
        return;
      }

      sessionRef.current = session;
      startAbortRef.current = null;
      setStatus("active");
    } catch (startError) {
      if (
        abortController.signal.aborted ||
        sessionRequestIdRef.current !== requestId
      ) {
        return;
      }

      sessionRef.current = null;
      setStatus("error");
      setError(
        startError instanceof Error
          ? startError.message
          : "Failed to start voice session",
      );
    } finally {
      if (startAbortRef.current === abortController) {
        startAbortRef.current = null;
      }
    }
  }, [status]);

  useEffect(() => {
    return () => {
      clearEnterMotionTimer();
      clearExitMotionTimer();
      startAbortRef.current?.abort();
      startAbortRef.current = null;
      sessionRequestIdRef.current += 1;
      const session = sessionRef.current;
      sessionRef.current = null;
      void session?.end();
    };
  }, [clearEnterMotionTimer, clearExitMotionTimer]);

  const isLive = status === "active";
  const isBusy = status === "starting" || status === "ending";
  const showMotionMark =
    status === "starting" ||
    (status === "active" && (mode === "connecting" || mode === "thinking"));
  const isSpeakingAuraActive = status === "active" && mode === "speaking";
  const canPress = !isBusy;

  useEffect(() => {
    const preferenceTimer = window.setTimeout(() => {
      const { phase } = thinkingMotionRef.current;

      if (showMotionMark) {
        if (phase === "settled") {
          startFreshThinkingMotion();
        } else if (phase === "leaving") {
          queuedMotionRestartRef.current = true;
        }
        return;
      }

      if (phase === "entering" || phase === "visible") {
        fadeOutThinkingMotion();
      } else if (phase === "leaving") {
        queuedMotionRestartRef.current = false;
      }
    }, 0);

    return () => window.clearTimeout(preferenceTimer);
  }, [fadeOutThinkingMotion, showMotionMark, startFreshThinkingMotion]);

  return (
    <div className={`th-customer-call ${isLive ? "is-live" : ""}`}>
      <div
        className={`th-customer-call-status is-${status}`}
        aria-live="polite"
      >
        <span className="th-customer-call-dot" />
        {getStatusText(status, mode)}
      </div>

      <div
        className={`th-customer-wave-stage ${isSpeakingAuraActive ? "is-speaking" : ""}`}
        aria-hidden="true"
      >
        <span className="th-customer-wave th-customer-wave-one" />
        <span className="th-customer-wave th-customer-wave-two" />
        <span className="th-customer-wave th-customer-wave-three" />
        <div
          className={`th-customer-logo-pulse is-${thinkingMotionState.phase}`}
        >
          <img
            key={thinkingMotionState.renderKey}
            src={thinkingMotionAsset}
            alt=""
            className="th-customer-thinking-motion"
          />
          <img src={mark} alt="" className="th-customer-brand-mark" />
        </div>
      </div>

      <div className="th-customer-call-copy">
        <p>KFC Vietnam</p>
        <span>Twohearts AI voice agent</span>
      </div>

      {error && <div className="th-customer-call-error">{error}</div>}

      {status === "idle" || status === "ended" || status === "error" ? (
        <label
          className="th-customer-call-phone"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.35rem",
            width: "min(280px, 80%)",
          }}
        >
          <span
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "rgba(60,60,60,0.7)",
              textAlign: "left",
            }}
          >
            Số điện thoại của bạn
          </span>
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0901 234 567"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            aria-label="Số điện thoại"
            style={{
              padding: "0.6rem 0.8rem",
              borderRadius: "0.6rem",
              border: `1.5px solid ${
                phoneInput && !isPhoneValid(normalizePhoneInput(phoneInput))
                  ? "#e05656"
                  : "rgba(0,0,0,0.15)"
              }`,
              outline: "none",
              fontSize: "0.95rem",
              background: "#fff",
              color: "#111",
              textAlign: "center",
              letterSpacing: "0.05em",
            }}
          />
          {phoneInput && !isPhoneValid(normalizePhoneInput(phoneInput)) ? (
            <span
              style={{
                fontSize: "0.7rem",
                color: "#c04141",
                textAlign: "left",
              }}
            >
              Sai định dạng — nhập 0XXXXXXXXX hoặc +84XXXXXXXXX
            </span>
          ) : null}
        </label>
      ) : null}

      <button
        type="button"
        className={`th-customer-call-button ${isLive ? "is-ending" : ""}`}
        style={{ "--customer-call-accent": kfcRed } as CSSProperties}
        onClick={() => {
          if (isLive) {
            void endSession();
            return;
          }

          void startSession();
        }}
        disabled={!canPress}
      >
        {getButtonLabel(status)}
      </button>
    </div>
  );
}
