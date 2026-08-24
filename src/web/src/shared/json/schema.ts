export type SchemaOptions = {
  inferRequired?: boolean
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function inferSchema(value: unknown, options: SchemaOptions): Record<string, unknown> {
  if (value === null) {
    return { type: 'null' }
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return { type: 'array', items: {} }
    }
    const itemSchemas = value.map((item) => inferSchema(item, options))
    const merged = itemSchemas.reduce((acc, item) => mergeSchema(acc, item), itemSchemas[0]!)
    return { type: 'array', items: merged }
  }
  switch (typeof value) {
    case 'string': {
      const schema: Record<string, unknown> = { type: 'string' }
      if (/^\d{4}-\d{2}-\d{2}/.test(value)) schema.format = 'date-time'
      else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) schema.format = 'email'
      else if (/^https?:\/\//i.test(value)) schema.format = 'uri'
      schema.minLength = 0
      schema.maxLength = Math.max(value.length, 1)
      return schema
    }
    case 'number':
      return Number.isInteger(value)
        ? { type: 'integer', minimum: value, maximum: value }
        : { type: 'number', minimum: value, maximum: value }
    case 'boolean':
      return { type: 'boolean' }
    case 'object': {
      if (!isObject(value)) return {}
      const properties: Record<string, unknown> = {}
      for (const [key, child] of Object.entries(value)) {
        properties[key] = inferSchema(child, options)
      }
      const schema: Record<string, unknown> = { type: 'object', properties }
      if (options.inferRequired !== false) {
        schema.required = Object.keys(properties)
      }
      return schema
    }
    default:
      return {}
  }
}

function mergeSchema(a: Record<string, unknown>, b: Record<string, unknown>): Record<string, unknown> {
  if (a.type !== b.type) {
    return { anyOf: [a, b] }
  }
  if (a.type === 'object' && b.type === 'object') {
    const aProps = (a.properties ?? {}) as Record<string, Record<string, unknown>>
    const bProps = (b.properties ?? {}) as Record<string, Record<string, unknown>>
    const keys = new Set([...Object.keys(aProps), ...Object.keys(bProps)])
    const properties: Record<string, unknown> = {}
    for (const key of keys) {
      if (aProps[key] && bProps[key]) properties[key] = mergeSchema(aProps[key]!, bProps[key]!)
      else properties[key] = aProps[key] ?? bProps[key]
    }
    return { type: 'object', properties, required: [...keys] }
  }
  if (a.type === 'array' && b.type === 'array') {
    const aItems = (a.items ?? {}) as Record<string, unknown>
    const bItems = (b.items ?? {}) as Record<string, unknown>
    return { type: 'array', items: mergeSchema(aItems, bItems) }
  }
  if (a.type === 'string' || a.type === 'number' || a.type === 'integer') {
    const out = { ...a }
    if (typeof a.minimum === 'number' && typeof b.minimum === 'number') {
      out.minimum = Math.min(a.minimum, b.minimum)
    }
    if (typeof a.maximum === 'number' && typeof b.maximum === 'number') {
      out.maximum = Math.max(a.maximum, b.maximum)
    }
    if (typeof a.minLength === 'number' && typeof b.minLength === 'number') {
      out.minLength = Math.min(a.minLength, b.minLength)
    }
    if (typeof a.maxLength === 'number' && typeof b.maxLength === 'number') {
      out.maxLength = Math.max(a.maxLength, b.maxLength)
    }
    return out
  }
  return a
}

export function generateJsonSchema(value: unknown, options: SchemaOptions = {}): Record<string, unknown> {
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    ...inferSchema(value, options),
  }
}

export function stringifySchema(value: unknown, options?: SchemaOptions): string {
  return `${JSON.stringify(generateJsonSchema(value, options), null, 2)}\n`
}
