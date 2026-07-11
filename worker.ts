export interface Env {
  CONTENT_KV: KVNamespace
  ASSETS: Fetcher
}

const CONTENT_KEY = 'kfc-demo:content'
const MAX_BODY_SIZE = 512 * 1024

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/content.json' && (request.method === 'GET' || request.method === 'HEAD')) {
      const content = (await env.CONTENT_KV.get(CONTENT_KEY)) ?? '{}'

      return new Response(request.method === 'HEAD' ? null : content, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        },
      })
    }

    if (url.pathname === '/content.json' && request.method === 'PUT') {
      const contentType = request.headers.get('Content-Type')?.split(';', 1)[0].trim().toLowerCase()
      if (contentType !== 'application/json') {
        return new Response('Content-Type must be application/json', { status: 400 })
      }

      const contentLength = Number(request.headers.get('Content-Length'))
      if (Number.isFinite(contentLength) && contentLength > MAX_BODY_SIZE) {
        return new Response('Request body exceeds 512KB', { status: 413 })
      }

      const reader = request.body?.getReader()
      const chunks: Uint8Array[] = []
      let bodySize = 0

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          bodySize += value.byteLength
          if (bodySize > MAX_BODY_SIZE) {
            await reader.cancel()
            return new Response('Request body exceeds 512KB', { status: 413 })
          }
          chunks.push(value)
        }
      }

      const body = new Uint8Array(bodySize)
      let offset = 0
      for (const chunk of chunks) {
        body.set(chunk, offset)
        offset += chunk.byteLength
      }

      const content = new TextDecoder().decode(body)
      let parsed: unknown
      try {
        parsed = JSON.parse(content)
      } catch {
        return new Response('Invalid JSON', { status: 400 })
      }
      if (
        parsed === null ||
        typeof parsed !== 'object' ||
        Array.isArray(parsed) ||
        Object.getPrototypeOf(parsed) !== Object.prototype
      ) {
        return new Response('JSON body must be an object', { status: 400 })
      }

      await env.CONTENT_KV.put(CONTENT_KEY, content)
      return Response.json({ ok: true })
    }

    return env.ASSETS.fetch(request)
  },
}
