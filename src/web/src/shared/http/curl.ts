import type { HttpRequest } from './request'

function shellEscape(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`
}

export function generateCurl(req: HttpRequest): string {
  const parts = ['curl', '-X', req.method, shellEscape(req.url)]
  for (const [key, value] of Object.entries(req.headers)) {
    if (key.trim()) {
      parts.push('-H', shellEscape(`${key}: ${value}`))
    }
  }
  if (req.body && req.method !== 'GET' && req.method !== 'HEAD') {
    parts.push('-d', shellEscape(req.body))
  }
  return `${parts.join(' ')}\n`
}
