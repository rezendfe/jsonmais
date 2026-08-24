export type SortDir = 'asc' | 'desc'

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function flatten(value: unknown, prefix = '', sep = '.'): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  const walk = (current: unknown, path: string) => {
    if (isObject(current)) {
      const keys = Object.keys(current)
      if (keys.length === 0 && path) {
        out[path] = {}
        return
      }
      for (const [key, child] of Object.entries(current)) {
        const next = path ? `${path}${sep}${key}` : key
        walk(child, next)
      }
      return
    }
    if (Array.isArray(current)) {
      if (current.length === 0 && path) {
        out[path] = []
        return
      }
      current.forEach((child, index) => {
        const next = path ? `${path}${sep}${index}` : String(index)
        walk(child, next)
      })
      return
    }
    out[path || ''] = current
  }
  walk(value, prefix)
  if (Object.keys(out).length === 1 && '' in out && !prefix) {
    return { '': out[''] }
  }
  return out
}

export function unflatten(value: Record<string, unknown>, sep = '.'): unknown {
  const root: Record<string, unknown> = {}
  for (const [path, leaf] of Object.entries(value)) {
    if (path === '') return leaf
    const parts = path.split(sep)
    let current: Record<string, unknown> | unknown[] = root
    for (let i = 0; i < parts.length; i += 1) {
      const part = parts[i]!
      const isLast = i === parts.length - 1
      const nextPart = parts[i + 1]
      const asIndex = /^\d+$/.test(part)
      if (isLast) {
        if (Array.isArray(current)) current[Number(part)] = leaf
        else current[part] = leaf
        continue
      }
      const wantArray = nextPart !== undefined && /^\d+$/.test(nextPart)
      if (Array.isArray(current)) {
        const index = Number(part)
        if (current[index] === undefined) current[index] = wantArray ? [] : {}
        current = current[index] as Record<string, unknown> | unknown[]
      } else if (asIndex && Array.isArray((current as Record<string, unknown>)[part])) {
        current = (current as Record<string, unknown>)[part] as unknown[]
      } else {
        const obj = current as Record<string, unknown>
        if (obj[part] === undefined) obj[part] = wantArray ? [] : {}
        current = obj[part] as Record<string, unknown> | unknown[]
      }
    }
  }
  return root
}

export function sortKeys(value: unknown, dir: SortDir = 'asc'): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sortKeys(item, dir))
  }
  if (!isObject(value)) return value
  const keys = Object.keys(value).sort((a, b) => (dir === 'asc' ? a.localeCompare(b) : b.localeCompare(a)))
  const out: Record<string, unknown> = {}
  for (const key of keys) {
    out[key] = sortKeys(value[key], dir)
  }
  return out
}

export function sortArray(value: unknown, key?: string, dir: SortDir = 'asc'): unknown {
  if (!Array.isArray(value)) {
    throw new Error('sortArray exige um array')
  }
  const factor = dir === 'asc' ? 1 : -1
  const copy = [...value]
  copy.sort((a, b) => {
    const left = key && isObject(a) ? a[key] : a
    const right = key && isObject(b) ? b[key] : b
    if (left === right) return 0
    if (left === null || left === undefined) return -1 * factor
    if (right === null || right === undefined) return 1 * factor
    if (typeof left === 'number' && typeof right === 'number') return (left - right) * factor
    return String(left).localeCompare(String(right)) * factor
  })
  return copy
}
