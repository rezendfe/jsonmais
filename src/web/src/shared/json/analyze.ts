export type JsonStats = {
  objects: number
  arrays: number
  strings: number
  numbers: number
  booleans: number
  nulls: number
  maxDepth: number
  sizeBytes: number
  largestArrayLength: number
}

export type InspectResult = {
  path: string
  jsonPath: string
  type: string
  value: unknown
}

function valueType(value: unknown): string {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value
}

function walk(value: unknown, depth: number, stats: JsonStats): void {
  stats.maxDepth = Math.max(stats.maxDepth, depth)
  if (value === null) {
    stats.nulls += 1
    return
  }
  if (Array.isArray(value)) {
    stats.arrays += 1
    stats.largestArrayLength = Math.max(stats.largestArrayLength, value.length)
    for (const item of value) {
      walk(item, depth + 1, stats)
    }
    return
  }
  switch (typeof value) {
    case 'object':
      stats.objects += 1
      for (const child of Object.values(value as Record<string, unknown>)) {
        walk(child, depth + 1, stats)
      }
      return
    case 'string':
      stats.strings += 1
      return
    case 'number':
      stats.numbers += 1
      return
    case 'boolean':
      stats.booleans += 1
      return
    default:
      return
  }
}

export function computeStats(text: string, value: unknown): JsonStats {
  const stats: JsonStats = {
    objects: 0,
    arrays: 0,
    strings: 0,
    numbers: 0,
    booleans: 0,
    nulls: 0,
    maxDepth: 0,
    sizeBytes: new TextEncoder().encode(text).length,
    largestArrayLength: 0,
  }
  walk(value, 0, stats)
  return stats
}

export function pointerToJsonPath(pointer: string): string {
  if (!pointer || pointer === '/') return '$'
  const parts = pointer
    .split('/')
    .slice(1)
    .map((segment) => segment.replace(/~1/g, '/').replace(/~0/g, '~'))
  return parts.reduce((acc, part) => {
    if (/^\d+$/.test(part)) return `${acc}[${part}]`
    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(part)) return `${acc}.${part}`
    return `${acc}['${part.replace(/'/g, "\\'")}']`
  }, '$')
}

export function getByPointer(root: unknown, pointer: string): unknown {
  if (!pointer || pointer === '/') return root
  const parts = pointer
    .split('/')
    .slice(1)
    .map((segment) => segment.replace(/~1/g, '/').replace(/~0/g, '~'))
  let current: unknown = root
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      throw new Error(`Caminho não encontrado: ${pointer}`)
    }
    if (Array.isArray(current)) {
      const index = Number(part)
      if (!Number.isInteger(index) || index < 0 || index >= current.length) {
        throw new Error(`Caminho não encontrado: ${pointer}`)
      }
      current = current[index]
    } else {
      const record = current as Record<string, unknown>
      if (!(part in record)) {
        throw new Error(`Caminho não encontrado: ${pointer}`)
      }
      current = record[part]
    }
  }
  return current
}

export function inspectAtPointer(root: unknown, pointer: string): InspectResult {
  const normalized = pointer.trim() === '' ? '/' : pointer.trim()
  const value = getByPointer(root, normalized)
  return {
    path: normalized.startsWith('/') ? normalized : `/${normalized}`,
    jsonPath: pointerToJsonPath(normalized.startsWith('/') ? normalized : `/${normalized}`),
    type: valueType(value),
    value,
  }
}
