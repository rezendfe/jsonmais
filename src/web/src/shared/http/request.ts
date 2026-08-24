export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD'

export type HttpRequest = {
  method: HttpMethod
  url: string
  headers: Record<string, string>
  body?: string
}

export type HttpResponseOk = {
  ok: true
  status: number
  statusText: string
  headers: Record<string, string>
  bodyText: string
  durationMs: number
}

export type HttpResponseFail = { ok: false; error: string }
export type HttpResponseResult = HttpResponseOk | HttpResponseFail

export function parseHeadersText(text: string): Record<string, string> {
  const headers: Record<string, string> = {}
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  for (const line of lines) {
    const idx = line.indexOf(':')
    if (idx <= 0) continue
    const key = line.slice(0, idx).trim()
    const value = line.slice(idx + 1).trim()
    if (key) headers[key] = value
  }
  return headers
}

export function formatHttpResponse(result: HttpResponseOk): string {
  const headerLines = Object.entries(result.headers)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n')
  return `${result.status} ${result.statusText} (${result.durationMs} ms)\n\n${headerLines}\n\n${result.bodyText}`
}

export async function executeHttpRequest(
  req: HttpRequest,
  fetchFn: typeof fetch = fetch,
): Promise<HttpResponseResult> {
  const url = req.url.trim()
  if (!url) {
    return { ok: false, error: 'Informe a URL.' }
  }
  try {
    const started = Date.now()
    const init: RequestInit = {
      method: req.method,
      headers: req.headers,
    }
    if (req.body && req.method !== 'GET' && req.method !== 'HEAD') {
      init.body = req.body
    }
    const response = await fetchFn(url, init)
    const bodyText = await response.text()
    const headers: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      headers[key] = value
    })
    return {
      ok: true,
      status: response.status,
      statusText: response.statusText,
      headers,
      bodyText,
      durationMs: Date.now() - started,
    }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Falha na requisição (CORS ou rede).',
    }
  }
}
