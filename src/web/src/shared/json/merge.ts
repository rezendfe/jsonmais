export type MergeMode = 'shallow' | 'deep' | 'overwrite'

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function deepMerge(a: unknown, b: unknown): unknown {
  if (Array.isArray(a) && Array.isArray(b)) {
    return [...a, ...b]
  }
  if (isObject(a) && isObject(b)) {
    const out: Record<string, unknown> = { ...a }
    for (const [key, value] of Object.entries(b)) {
      if (Object.prototype.hasOwnProperty.call(out, key)) {
        out[key] = deepMerge(out[key], value)
      } else {
        out[key] = structuredClone(value)
      }
    }
    return out
  }
  return structuredClone(b)
}

export function mergeJson(a: unknown, b: unknown, mode: MergeMode): unknown {
  switch (mode) {
    case 'overwrite':
      return structuredClone(b)
    case 'shallow': {
      if (isObject(a) && isObject(b)) {
        return { ...a, ...b }
      }
      return structuredClone(b)
    }
    case 'deep':
      return deepMerge(a, b)
  }
}
