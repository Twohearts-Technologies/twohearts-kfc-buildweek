export interface Env {
  CONTENT_KV: KVNamespace;
  ASSETS: Fetcher;
  /** 6-digit access code (Worker secret). When unset, the gate is open. */
  ACCESS_CODE?: string;
}

const CONTENT_KEY = "kfc-demo:content";
const MAX_BODY_SIZE = 512 * 1024;

// ---- Access gate ----------------------------------------------------------
// The code lives only in the Worker env (secret) and is validated here,
// server-side. The browser bundle never receives it. On success we set a
// signed, HttpOnly cookie derived from the code via HMAC, so it can be
// verified on later requests but not forged without knowing the code.
const GATE_COOKIE = "th_gate";
const GATE_MSG = "th-gate-v1";
const GATE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

async function gateToken(code: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(code),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(GATE_MSG),
  );
  return [...new Uint8Array(sig)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Constant-time string comparison (avoids leaking length/prefix via timing). */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("Cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === name) return part.slice(eq + 1).trim();
  }
  return null;
}

async function isUnlocked(request: Request, env: Env): Promise<boolean> {
  if (!env.ACCESS_CODE) return true; // no code configured → gate disabled (open)
  const cookie = readCookie(request, GATE_COOKIE);
  if (!cookie) return false;
  return safeEqual(cookie, await gateToken(env.ACCESS_CODE));
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // ---- Access gate ----
    if (url.pathname === "/api/gate/status" && request.method === "GET") {
      return Response.json({ unlocked: await isUnlocked(request, env) });
    }

    if (url.pathname === "/api/gate" && request.method === "POST") {
      if (!env.ACCESS_CODE) {
        return Response.json({ ok: true, open: true });
      }
      const body = (await request.json().catch(() => null)) as {
        code?: unknown;
      } | null;
      const code = typeof body?.code === "string" ? body.code.trim() : "";
      if (!code || !safeEqual(code, env.ACCESS_CODE)) {
        // Small delay to slow brute-force of the 6-digit space.
        await new Promise((r) => setTimeout(r, 400));
        return new Response(JSON.stringify({ ok: false }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
      const token = await gateToken(env.ACCESS_CODE);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": `${GATE_COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${GATE_MAX_AGE}`,
        },
      });
    }

    if (
      url.pathname === "/content.json" &&
      (request.method === "GET" || request.method === "HEAD")
    ) {
      const content = (await env.CONTENT_KV.get(CONTENT_KEY)) ?? "{}";

      return new Response(request.method === "HEAD" ? null : content, {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        },
      });
    }

    if (url.pathname === "/content.json" && request.method === "PUT") {
      const contentType = request.headers
        .get("Content-Type")
        ?.split(";", 1)[0]
        .trim()
        .toLowerCase();
      if (contentType !== "application/json") {
        return new Response("Content-Type must be application/json", {
          status: 400,
        });
      }

      const contentLength = Number(request.headers.get("Content-Length"));
      if (Number.isFinite(contentLength) && contentLength > MAX_BODY_SIZE) {
        return new Response("Request body exceeds 512KB", { status: 413 });
      }

      const reader = request.body?.getReader();
      const chunks: Uint8Array[] = [];
      let bodySize = 0;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          bodySize += value.byteLength;
          if (bodySize > MAX_BODY_SIZE) {
            await reader.cancel();
            return new Response("Request body exceeds 512KB", { status: 413 });
          }
          chunks.push(value);
        }
      }

      const body = new Uint8Array(bodySize);
      let offset = 0;
      for (const chunk of chunks) {
        body.set(chunk, offset);
        offset += chunk.byteLength;
      }

      const content = new TextDecoder().decode(body);
      let parsed: unknown;
      try {
        parsed = JSON.parse(content);
      } catch {
        return new Response("Invalid JSON", { status: 400 });
      }
      if (
        parsed === null ||
        typeof parsed !== "object" ||
        Array.isArray(parsed) ||
        Object.getPrototypeOf(parsed) !== Object.prototype
      ) {
        return new Response("JSON body must be an object", { status: 400 });
      }

      await env.CONTENT_KV.put(CONTENT_KEY, content);
      return Response.json({ ok: true });
    }

    return env.ASSETS.fetch(request);
  },
};
