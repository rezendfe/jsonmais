function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hashSeed(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

const FIRST = ['Ana', 'Bruno', 'Carla', 'Diego', 'Elena', 'Felipe', 'Gina', 'Hugo']
const LAST = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Costa', 'Pereira', 'Almeida']
const CITIES = ['São Paulo', 'Rio', 'Belo Horizonte', 'Curitiba', 'Porto Alegre', 'Recife']
const DOMAINS = ['example.com', 'mail.test', 'dev.local']

function pick<T>(rand: () => number, list: T[]): T {
  return list[Math.floor(rand() * list.length)]!
}

function mockPrimitive(key: string, sample: unknown, rand: () => number, index: number): unknown {
  const lower = key.toLowerCase()
  if (typeof sample === 'boolean') return rand() > 0.5
  if (typeof sample === 'number') {
    if (Number.isInteger(sample)) return Math.floor(rand() * 1000) + index
    return Number((rand() * 1000).toFixed(2))
  }
  if (sample === null) return null
  if (typeof sample !== 'string') return sample

  if (/e-?mail/.test(lower)) {
    return `${pick(rand, FIRST).toLowerCase()}.${index}@${pick(rand, DOMAINS)}`
  }
  if (/name|nome/.test(lower)) {
    return `${pick(rand, FIRST)} ${pick(rand, LAST)}`
  }
  if (/city|cidade/.test(lower)) return pick(rand, CITIES)
  if (/phone|telefone|celular/.test(lower)) {
    return `+55 11 9${String(Math.floor(rand() * 1e8)).padStart(8, '0')}`
  }
  if (/uuid|guid|id$/.test(lower)) {
    const hex = () => Math.floor(rand() * 16).toString(16)
    return `${Array.from({ length: 8 }, hex).join('')}-${Array.from({ length: 4 }, hex).join('')}-4${Array.from({ length: 3 }, hex).join('')}-a${Array.from({ length: 3 }, hex).join('')}-${Array.from({ length: 12 }, hex).join('')}`
  }
  if (/url|website|site/.test(lower)) return `https://${pick(rand, DOMAINS)}/item/${index}`
  if (/date|created|updated|data/.test(lower)) {
    const d = new Date(Date.UTC(2020 + Math.floor(rand() * 6), Math.floor(rand() * 12), 1 + Math.floor(rand() * 27)))
    return d.toISOString()
  }
  if (/cpf/.test(lower)) return `${String(Math.floor(rand() * 1e9)).padStart(9, '0')}${String(Math.floor(rand() * 100)).padStart(2, '0')}`
  if (/cnpj/.test(lower)) return `${String(Math.floor(rand() * 1e8)).padStart(8, '0')}0001${String(Math.floor(rand() * 100)).padStart(2, '0')}`
  return `${sample}_${index}`
}

function mockValue(sample: unknown, key: string, rand: () => number, index: number): unknown {
  if (Array.isArray(sample)) {
    if (sample.length === 0) return []
    const len = Math.max(1, Math.min(sample.length, 3))
    return Array.from({ length: len }, (_, i) => mockValue(sample[i % sample.length], key, rand, index + i))
  }
  if (isObject(sample)) {
    const out: Record<string, unknown> = {}
    for (const [childKey, child] of Object.entries(sample)) {
      out[childKey] = mockValue(child, childKey, rand, index)
    }
    return out
  }
  return mockPrimitive(key, sample, rand, index)
}

export function generateMock(sample: unknown, count: number): unknown {
  const n = Math.min(1000, Math.max(1, Math.floor(count)))
  const seed = hashSeed(JSON.stringify(sample))
  if (Array.isArray(sample)) {
    const item = sample[0] ?? {}
    return Array.from({ length: n }, (_, i) => {
      const rand = mulberry32(seed + i * 997)
      return mockValue(item, 'item', rand, i + 1)
    })
  }
  if (n === 1) {
    const rand = mulberry32(seed)
    return mockValue(sample, 'root', rand, 1)
  }
  return Array.from({ length: n }, (_, i) => {
    const rand = mulberry32(seed + i * 997)
    return mockValue(sample, 'root', rand, i + 1)
  })
}
