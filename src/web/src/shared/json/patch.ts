export type JsonPatchOp =
  | { op: 'add'; path: string; value: unknown }
  | { op: 'remove'; path: string }
  | { op: 'replace'; path: string; value: unknown }
  | { op: 'move'; from: string; path: string }
  | { op: 'copy'; from: string; path: string }
  | { op: 'test'; path: string; value: unknown }

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function encodePointerSegment(segment: string): string {
  return segment.replace(/~/g, '~0').replace(/\//g, '~1')
}

function decodePointerSegment(segment: string): string {
  return segment.replace(/~1/g, '/').replace(/~0/g, '~')
}

export function splitPointer(path: string): string[] {
  if (path === '' || path === '/') return []
  if (!path.startsWith('/')) {
    throw new Error(`JSON Pointer inválido: ${path}`)
  }
  return path
    .slice(1)
    .split('/')
    .map(decodePointerSegment)
}

function pointerJoin(parent: string, key: string | number): string {
  const segment = encodePointerSegment(String(key))
  return parent === '' ? `/${segment}` : `${parent}/${segment}`
}

function cloneValue<T>(value: T): T {
  return structuredClone(value)
}

function getAt(doc: unknown, path: string): unknown {
  const parts = splitPointer(path)
  let current: unknown = doc
  for (const part of parts) {
    if (Array.isArray(current)) {
      const index = Number(part)
      if (!Number.isInteger(index) || index < 0 || index >= current.length) {
        throw new Error(`Caminho não encontrado: ${path}`)
      }
      current = current[index]
    } else if (isObject(current)) {
      if (!Object.prototype.hasOwnProperty.call(current, part)) {
        throw new Error(`Caminho não encontrado: ${path}`)
      }
      current = current[part]
    } else {
      throw new Error(`Caminho não encontrado: ${path}`)
    }
  }
  return current
}

function setAt(doc: unknown, path: string, value: unknown, mode: 'add' | 'replace'): unknown {
  const parts = splitPointer(path)
  if (parts.length === 0) {
    return cloneValue(value)
  }
  const root = cloneValue(doc)
  let parent: unknown = root
  for (let i = 0; i < parts.length - 1; i += 1) {
    const part = parts[i]!
    if (Array.isArray(parent)) {
      parent = parent[Number(part)]
    } else if (isObject(parent)) {
      parent = parent[part]
    } else {
      throw new Error(`Caminho inválido: ${path}`)
    }
  }
  const last = parts[parts.length - 1]!
  if (Array.isArray(parent)) {
    if (last === '-') {
      parent.push(cloneValue(value))
      return root
    }
    const index = Number(last)
    if (!Number.isInteger(index) || index < 0 || index > parent.length) {
      throw new Error(`Índice inválido: ${path}`)
    }
    if (mode === 'add') parent.splice(index, 0, cloneValue(value))
    else parent[index] = cloneValue(value)
    return root
  }
  if (isObject(parent)) {
    if (mode === 'replace' && !Object.prototype.hasOwnProperty.call(parent, last)) {
      throw new Error(`Caminho não encontrado: ${path}`)
    }
    parent[last] = cloneValue(value)
    return root
  }
  throw new Error(`Caminho inválido: ${path}`)
}

function removeAt(doc: unknown, path: string): unknown {
  const parts = splitPointer(path)
  if (parts.length === 0) {
    throw new Error('Não é possível remover a raiz')
  }
  const root = cloneValue(doc)
  let parent: unknown = root
  for (let i = 0; i < parts.length - 1; i += 1) {
    const part = parts[i]!
    if (Array.isArray(parent)) parent = parent[Number(part)]
    else if (isObject(parent)) parent = parent[part]
    else throw new Error(`Caminho inválido: ${path}`)
  }
  const last = parts[parts.length - 1]!
  if (Array.isArray(parent)) {
    const index = Number(last)
    if (!Number.isInteger(index) || index < 0 || index >= parent.length) {
      throw new Error(`Caminho não encontrado: ${path}`)
    }
    parent.splice(index, 1)
    return root
  }
  if (isObject(parent)) {
    if (!Object.prototype.hasOwnProperty.call(parent, last)) {
      throw new Error(`Caminho não encontrado: ${path}`)
    }
    delete parent[last]
    return root
  }
  throw new Error(`Caminho inválido: ${path}`)
}

function walkDiff(left: unknown, right: unknown, path: string, ops: JsonPatchOp[]): void {
  if (Object.is(left, right)) return

  if (isObject(left) && isObject(right)) {
    const keys = new Set([...Object.keys(left), ...Object.keys(right)])
    for (const key of keys) {
      const next = pointerJoin(path, key)
      const hasL = Object.prototype.hasOwnProperty.call(left, key)
      const hasR = Object.prototype.hasOwnProperty.call(right, key)
      if (hasL && !hasR) ops.push({ op: 'remove', path: next })
      else if (!hasL && hasR) ops.push({ op: 'add', path: next, value: right[key] })
      else walkDiff(left[key], right[key], next, ops)
    }
    return
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    const max = Math.max(left.length, right.length)
    for (let i = max - 1; i >= 0; i -= 1) {
      const next = pointerJoin(path, i)
      if (i >= left.length) ops.push({ op: 'add', path: next, value: right[i] })
      else if (i >= right.length) ops.push({ op: 'remove', path: next })
      else walkDiff(left[i], right[i], next, ops)
    }
    return
  }

  ops.push({ op: 'replace', path: path || '', value: right })
}

export function diffToJsonPatch(left: unknown, right: unknown): JsonPatchOp[] {
  const ops: JsonPatchOp[] = []
  walkDiff(left, right, '', ops)
  return ops.map((op) => (op.path === '' ? { ...op, path: '' } : op))
}

export function applyJsonPatch(doc: unknown, patch: JsonPatchOp[]): unknown {
  let current = cloneValue(doc)
  for (const op of patch) {
    switch (op.op) {
      case 'add':
        current = setAt(current, op.path, op.value, 'add')
        break
      case 'replace':
        current = setAt(current, op.path, op.value, 'replace')
        break
      case 'remove':
        current = removeAt(current, op.path)
        break
      case 'test': {
        const actual = getAt(current, op.path)
        if (JSON.stringify(actual) !== JSON.stringify(op.value)) {
          throw new Error(`test falhou em ${op.path}`)
        }
        break
      }
      case 'move': {
        const value = getAt(current, op.from)
        current = removeAt(current, op.from)
        current = setAt(current, op.path, value, 'add')
        break
      }
      case 'copy': {
        const value = getAt(current, op.from)
        current = setAt(current, op.path, value, 'add')
        break
      }
      default:
        throw new Error('Operação de patch desconhecida')
    }
  }
  return current
}

export function stringifyPatch(ops: JsonPatchOp[]): string {
  return `${JSON.stringify(ops, null, 2)}\n`
}

export function parsePatch(text: string): JsonPatchOp[] {
  const value = JSON.parse(text) as unknown
  if (!Array.isArray(value)) {
    throw new Error('JSON Patch deve ser um array')
  }
  return value as JsonPatchOp[]
}
