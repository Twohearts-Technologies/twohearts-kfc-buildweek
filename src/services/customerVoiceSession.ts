type JsonObject = Record<string, unknown>;
type Wrapped<T> = { data: T } | T;

type ElevenStartOptions = Parameters<
  typeof import("@elevenlabs/client").Conversation.startSession
>[0];

type ElevenConversationSession = Awaited<
  ReturnType<typeof import("@elevenlabs/client").Conversation.startSession>
> & {
  endSession?: () => Promise<void> | void;
  end?: () => Promise<void> | void;
  disconnect?: () => Promise<void> | void;
  getId?: () => string | null | undefined;
};

interface VoiceDebugSessionRequest {
  tenantSlug?: string;
  tenantPk?: number;
  language?: string;
  callerPhone?: string;
  voiceId?: string;
}

interface ElevenVoiceDebugSession {
  sessionId: string;
  agentId: string;
  signedUrl: string;
  fallback?: boolean;
  overrides?: JsonObject;
  dynamicVariables?: JsonObject;
}

export type CustomerVoiceMode =
  | "listening"
  | "thinking"
  | "speaking"
  | "connecting";

export interface CustomerVoiceSessionHandle {
  sessionId: string;
  providerConversationId?: string;
  end: () => Promise<void>;
}

interface StartCustomerVoiceSessionOptions {
  signal?: AbortSignal;
  onModeChange?: (mode: CustomerVoiceMode) => void;
  onStatusChange?: (status: string) => void;
  onError?: (message: string) => void;
  /**
   * Per-call caller phone override. Takes precedence over VITE_VOICE_CALLER_PHONE.
   * Forwarded to the backend as `callerPhone` and shows up as the ElevenLabs
   * dynamic variable so the AI + call-detail dashboard know who's calling.
   */
  callerPhone?: string;
}

const configuredServerUrl =
  import.meta.env.VITE_SERVER_URL?.trim().replace(/\/$/, "") ?? "";
const configuredTenantSlug = import.meta.env.VITE_VOICE_TENANT_SLUG?.trim();
const configuredAuthSecret =
  import.meta.env.VITE_VOICE_AUTH_SECRET?.trim() || "JOIFACTORY";
const AUTH_HEADER_NAME = "X-Tenant-Auth";
const configuredTenantPk = Number.parseInt(
  import.meta.env.VITE_VOICE_TENANT_PK ?? "",
  10,
);
const configuredLanguage = import.meta.env.VITE_VOICE_LANGUAGE?.trim();
const configuredCallerPhone = import.meta.env.VITE_VOICE_CALLER_PHONE?.trim();
const configuredVoiceId = import.meta.env.VITE_VOICE_ID?.trim();
const configuredMockMode =
  import.meta.env.VITE_VOICE_MOCK?.trim().toLowerCase();
const useMockVoiceSession =
  configuredMockMode === "true" ||
  (!configuredServerUrl && configuredMockMode !== "false");
const mockVoiceModes: CustomerVoiceMode[] = [
  "listening",
  "thinking",
  "speaking",
  "thinking",
  "listening",
  "speaking",
];

const customerVoicePayload: VoiceDebugSessionRequest = {
  ...(configuredTenantSlug ? { tenantSlug: configuredTenantSlug } : {}),
  ...(Number.isFinite(configuredTenantPk)
    ? { tenantPk: configuredTenantPk }
    : {}),
  language: configuredLanguage || "vi",
  ...(configuredCallerPhone ? { callerPhone: configuredCallerPhone } : {}),
  ...(configuredVoiceId ? { voiceId: configuredVoiceId } : {}),
};

function unwrap<T>(data: Wrapped<T>): T {
  if (data !== null && typeof data === "object" && "data" in data) {
    return (data as { data: T }).data;
  }

  return data as T;
}

function buildApiUrl(path: string): string {
  return `${configuredServerUrl}${path}`;
}

function toHex(bytes: ArrayBuffer): string {
  const view = new Uint8Array(bytes);
  let out = "";
  for (let i = 0; i < view.length; i += 1) {
    out += view[i].toString(16).padStart(2, "0");
  }
  return out;
}

/**
 * Build a JOIFACTORY-signed auth header for voice session calls.
 * Payload = `${tenantSlug}:${timestampMs}`, HMAC-SHA256 signed with the
 * shared secret. Header shape: `${tenantSlug}:${timestampMs}:${sigHex}`.
 * The backend rejects requests where the timestamp is outside a 300s window
 * or the signature does not verify, so a captured header expires quickly.
 */
async function buildAuthHeader(): Promise<string | null> {
  if (!configuredAuthSecret) return null;
  const tenantSlug = configuredTenantSlug || "unknown";
  const timestampMs = Date.now();
  const payload = `${tenantSlug}:${String(timestampMs)}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(configuredAuthSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload),
  );
  return `${payload}:${toHex(signature)}`;
}

function createAbortError(): DOMException {
  return new DOMException("Voice session start was cancelled.", "AbortError");
}

async function readErrorMessage(response: Response): Promise<string> {
  const data = await response.json().catch(() => null);
  if (data && typeof data === "object") {
    const maybeMessage = (data as { message?: unknown; error?: unknown })
      .message;
    if (typeof maybeMessage === "string" && maybeMessage.trim()) {
      return maybeMessage;
    }

    const maybeError = (data as { error?: unknown }).error;
    if (typeof maybeError === "string" && maybeError.trim()) {
      return maybeError;
    }
  }

  return `Voice request failed (${response.status})`;
}

async function fetchVoiceJson<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const authHeader = await buildAuthHeader().catch(() => null);
  const response = await fetch(buildApiUrl(endpoint), {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(authHeader ? { [AUTH_HEADER_NAME]: authHeader } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  if (response.status === 204 || response.status === 304) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

async function createElevenVoiceSession(
  payload: VoiceDebugSessionRequest,
  signal?: AbortSignal,
): Promise<ElevenVoiceDebugSession> {
  const response = await fetchVoiceJson<Wrapped<ElevenVoiceDebugSession>>(
    "/api/ai/voice/eleven/public-session",
    {
      method: "POST",
      body: JSON.stringify(payload),
      signal,
    },
  );

  return unwrap(response);
}

async function deleteVoiceDebugSession(sessionId: string): Promise<void> {
  await fetchVoiceJson(
    `/api/ai/voice/eleven/public-session/${encodeURIComponent(sessionId)}`,
    { method: "DELETE" },
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function inferMode(value: unknown): CustomerVoiceMode {
  const raw =
    typeof value === "string"
      ? value
      : isRecord(value) && typeof value.mode === "string"
        ? value.mode
        : isRecord(value) && typeof value.status === "string"
          ? value.status
          : "";
  const mode = raw.toLowerCase();

  if (mode.includes("listen")) return "listening";
  if (mode.includes("speak") || mode.includes("talk")) return "speaking";
  if (
    mode.includes("think") ||
    mode.includes("process") ||
    mode.includes("tool")
  ) {
    return "thinking";
  }

  return "connecting";
}

async function endElevenSession(
  sessionId: string,
  activeSession: ElevenConversationSession,
): Promise<void> {
  let sdkEndError: unknown;

  try {
    if (activeSession.endSession) {
      await activeSession.endSession();
    } else if (activeSession.end) {
      await activeSession.end();
    } else if (activeSession.disconnect) {
      await activeSession.disconnect();
    }
  } catch (error) {
    sdkEndError = error;
  }

  try {
    await deleteVoiceDebugSession(sessionId);
  } catch (deleteError) {
    if (!sdkEndError) {
      throw deleteError;
    }
  }

  if (sdkEndError) {
    throw sdkEndError;
  }
}

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(createAbortError());
      return;
    }

    const abortWait = () => {
      window.clearTimeout(timeoutId);
      reject(createAbortError());
    };
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", abortWait);
      resolve();
    }, ms);
    signal?.addEventListener("abort", abortWait, { once: true });
  });
}

async function startMockCustomerVoiceSession({
  signal,
  onModeChange,
  onStatusChange,
}: StartCustomerVoiceSessionOptions): Promise<CustomerVoiceSessionHandle> {
  onStatusChange?.("mock.session_requested");
  onModeChange?.("connecting");
  await wait(520, signal);

  let modeIndex = 0;
  let intervalId: number | null = window.setInterval(() => {
    onModeChange?.(mockVoiceModes[modeIndex % mockVoiceModes.length]);
    modeIndex += 1;
  }, 1450);

  onStatusChange?.("mock.session_started");
  onModeChange?.(mockVoiceModes[modeIndex]);
  modeIndex += 1;

  return {
    sessionId: `mock-kfc-voice-${Date.now()}`,
    providerConversationId: `mock-conv-${Date.now()}`,
    end: async () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }

      onStatusChange?.("mock.session_ended");
      onModeChange?.("connecting");
      await wait(180);
    },
  };
}

export async function startCustomerVoiceSession({
  signal,
  onModeChange,
  onStatusChange,
  onError,
  callerPhone,
}: StartCustomerVoiceSessionOptions = {}): Promise<CustomerVoiceSessionHandle> {
  if (useMockVoiceSession) {
    return startMockCustomerVoiceSession({
      signal,
      onModeChange,
      onStatusChange,
      onError,
    });
  }

  const payload: VoiceDebugSessionRequest = {
    ...customerVoicePayload,
    ...(callerPhone ? { callerPhone } : {}),
  };
  const session = await createElevenVoiceSession(payload, signal);
  if (signal?.aborted) {
    await deleteVoiceDebugSession(session.sessionId).catch(() => undefined);
    throw createAbortError();
  }

  const { Conversation } = await import("@elevenlabs/client");
  let activeSession: ElevenConversationSession;
  try {
    activeSession = (await Conversation.startSession({
      signedUrl: session.signedUrl,
      overrides: session.overrides as ElevenStartOptions["overrides"],
      dynamicVariables:
        session.dynamicVariables as ElevenStartOptions["dynamicVariables"],
      customLlmExtraBody: { session_id: session.sessionId },
      onError: (sdkError) => {
        onError?.(
          typeof sdkError === "string" ? sdkError : "Voice session error",
        );
      },
      onStatusChange: (sdkStatus) => {
        onStatusChange?.(
          typeof sdkStatus === "string" ? sdkStatus : JSON.stringify(sdkStatus),
        );
        onModeChange?.(inferMode(sdkStatus));
      },
      onModeChange: (mode) => {
        onModeChange?.(inferMode(mode));
      },
    })) as ElevenConversationSession;
  } catch (startError) {
    await deleteVoiceDebugSession(session.sessionId).catch(() => undefined);
    throw startError;
  }

  if (signal?.aborted) {
    await endElevenSession(session.sessionId, activeSession).catch(
      () => undefined,
    );
    throw createAbortError();
  }

  return {
    sessionId: session.sessionId,
    providerConversationId: activeSession.getId?.() ?? undefined,
    end: () => endElevenSession(session.sessionId, activeSession),
  };
}
