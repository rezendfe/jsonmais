export type SensitiveKind =
  | 'email'
  | 'token'
  | 'password'
  | 'api_key'
  | 'jwt'
  | 'cpf'
  | 'cnpj'
  | 'card'
  | 'private_key'
  | 'phone'
  | 'secret'

export type SensitiveFinding = {
  path: string
  kind: SensitiveKind
  sample: string
}

const KEY_HINTS: Array<{ kind: SensitiveKind; re: RegExp }> = [
  { kind: 'password', re: /pass(word|wd)|senha/i },
  { kind: 'token', re: /token|bearer|auth/i },
  { kind: 'api_key', re: /api[_-]?key|apikey|access[_-]?key/i },
  { kind: 'secret', re: /secret|private/i },
  { kind: 'email', re: /e-?mail/i },
  { kind: 'cpf', re: /\bcpf\b/i },
  { kind: 'cnpj', re: /\bcnpj\b/i },
  { kind: 'phone', re: /phone|telefone|celular/i },
  { kind: 'card', re: /card|cartao|credit/i },
]

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function encodePointerSegment(segment: string): string {
  return segment.replace(/~/g, '~0').replace(/\//g, '~1')
}

function pointerJoin(parent: string, key: string | number): string {
  return `${parent}/${encodePointerSegment(String(key))}`
}

function redactSample(text: string): string {
  if (text.length <= 8) return '***'
  return `${text.slice(0, 2)}***${text.slice(-2)}`
}

function detectString(value: string, keyHint?: string): SensitiveKind | null {
  if (/-----BEGIN ([A-Z ]+ )?PRIVATE KEY-----/.test(value)) return 'private_key'
  if (/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value) && value.length > 40) return 'jwt'
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'email'
  if (/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(value)) return 'cpf'
  if (/^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/.test(value)) return 'cnpj'
  if (/^(?:\d[ -]*?){13,19}$/.test(value.replace(/\s/g, ''))) return 'card'
  if (/^\+?\d[\d\s()-]{8,}$/.test(value)) return 'phone'
  if (keyHint) {
    for (const hint of KEY_HINTS) {
      if (hint.re.test(keyHint)) return hint.kind
    }
  }
  if (/^(sk|pk|rk)[_-][A-Za-z0-9]{16,}$/i.test(value)) return 'api_key'
  return null
}

function walk(value: unknown, path: string, keyHint: string | undefined, findings: SensitiveFinding[]): void {
  if (typeof value === 'string') {
    const kind = detectString(value, keyHint)
    if (kind) {
      findings.push({ path: path || '/', kind, sample: redactSample(value) })
    }
    return
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, pointerJoin(path, index), keyHint, findings))
    return
  }
  if (isObject(value)) {
    for (const [key, child] of Object.entries(value)) {
      walk(child, pointerJoin(path, key), key, findings)
    }
  }
}

export function scanSensitive(value: unknown): SensitiveFinding[] {
  const findings: SensitiveFinding[] = []
  walk(value, '', undefined, findings)
  return findings
}

function maskString(value: string, kind: SensitiveKind): string {
  switch (kind) {
    case 'email': {
      const at = value.indexOf('@')
      if (at <= 0) return '***'
      return `***${value.slice(at)}`
    }
    case 'phone':
      return value.replace(/\d/g, (d, i) => (i < value.length - 4 ? '*' : d))
    case 'cpf':
    case 'cnpj':
    case 'card':
      return value.replace(/\d/g, '*')
    case 'jwt':
    case 'token':
    case 'api_key':
    case 'password':
    case 'secret':
    case 'private_key':
      return '***'
  }
}

function maskWalk(value: unknown, keyHint?: string): unknown {
  if (typeof value === 'string') {
    const kind = detectString(value, keyHint)
    return kind ? maskString(value, kind) : value
  }
  if (Array.isArray(value)) {
    return value.map((item) => maskWalk(item, keyHint))
  }
  if (isObject(value)) {
    const out: Record<string, unknown> = {}
    for (const [key, child] of Object.entries(value)) {
      out[key] = maskWalk(child, key)
    }
    return out
  }
  return value
}

export function maskSensitive(value: unknown): unknown {
  return maskWalk(value)
}
