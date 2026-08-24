export type DiffKind = 'added' | 'removed' | 'changed'

export type DiffEntry = {
  path: string
  kind: DiffKind
  /** Valor no painel esquerdo (removido ou alterado). */
  left?: unknown
  /** Valor no painel direito (adicionado ou alterado). */
  right?: unknown
}

export type StructuralDiff = {
  added: number
  removed: number
  changed: number
  entries: DiffEntry[]
}

function pathJoin(parent: string, key: string): string {
  return parent === '$' ? `$.${key}` : `${parent}.${key}`
}

function pathIndex(parent: string, index: number): string {
  return `${parent}[${index}]`
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function walk(left: unknown, right: unknown, path: string, acc: DiffEntry[]): void {
  if (Object.is(left, right)) {
    return
  }

  if (isObject(left) && isObject(right)) {
    const keys = new Set([...Object.keys(left), ...Object.keys(right)])
    for (const key of keys) {
      const next = pathJoin(path, key)
      const hasL = Object.prototype.hasOwnProperty.call(left, key)
      const hasR = Object.prototype.hasOwnProperty.call(right, key)
      if (hasL && !hasR) {
        acc.push({ path: next, kind: 'removed', left: left[key] })
      } else if (!hasL && hasR) {
        acc.push({ path: next, kind: 'added', right: right[key] })
      } else {
        walk(left[key], right[key], next, acc)
      }
    }
    return
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    const max = Math.max(left.length, right.length)
    for (let i = 0; i < max; i += 1) {
      const next = pathIndex(path, i)
      if (i >= left.length) {
        acc.push({ path: next, kind: 'added', right: right[i] })
      } else if (i >= right.length) {
        acc.push({ path: next, kind: 'removed', left: left[i] })
      } else {
        walk(left[i], right[i], next, acc)
      }
    }
    return
  }

  acc.push({ path, kind: 'changed', left, right })
}

export function structuralDiff(left: unknown, right: unknown): StructuralDiff {
  const entries: DiffEntry[] = []
  walk(left, right, '$', entries)
  return {
    added: entries.filter((e) => e.kind === 'added').length,
    removed: entries.filter((e) => e.kind === 'removed').length,
    changed: entries.filter((e) => e.kind === 'changed').length,
    entries,
  }
}

/** Caminho legível para UI (pt-BR). */
export function formatDiffPath(path: string): string {
  if (path === '$') {
    return 'documento (raiz)'
  }
  return path
    .replace(/^\$\.?/, '')
    .replace(/\[(\d+)\]/g, ' › [$1]')
    .replace(/\./g, ' › ')
}

/** Segmentos do caminho para breadcrumbs. */
export function diffPathSegments(path: string): string[] {
  if (path === '$') {
    return ['raiz']
  }
  const normalized = path.replace(/^\$\.?/, '')
  const segments: string[] = []
  const re = /([^.[\]]+)|\[(\d+)\]/g
  let match: RegExpExecArray | null
  while ((match = re.exec(normalized)) !== null) {
    segments.push(match[1] ?? `[${match[2]}]`)
  }
  return segments.length > 0 ? segments : [normalized]
}

/** Preview curto de valor JSON para UI (sem React). */
export function formatDiffPreview(value: unknown, maxLen = 72): string {
  if (value === undefined) {
    return '—'
  }
  let text: string
  try {
    text = JSON.stringify(value)
  } catch {
    text = String(value)
  }
  if (text === undefined) {
    return '—'
  }
  return text.length > maxLen ? `${text.slice(0, maxLen - 1)}…` : text
}
