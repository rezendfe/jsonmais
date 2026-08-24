import { afterEach, describe, expect, it } from 'vitest'
import {
  CLIENT_SESSION_STORAGE_KEY,
  ensureClientSession,
  endClientSession,
  maskSessionId,
} from './clientSession'

function createMemoryStorage(): Storage {
  const map = new Map<string, string>()
  return {
    get length() {
      return map.size
    },
    clear: () => map.clear(),
    getItem: (key) => map.get(key) ?? null,
    key: (index) => [...map.keys()][index] ?? null,
    removeItem: (key) => {
      map.delete(key)
    },
    setItem: (key, value) => {
      map.set(key, value)
    },
  }
}

describe('ensureClientSession', () => {
  afterEach(() => {
    endClientSession(createMemoryStorage())
    endClientSession(null)
  })

  it('creates a client id on first call', () => {
    const storage = createMemoryStorage()
    const info = ensureClientSession(storage)
    expect(info.clientId.length).toBeGreaterThan(0)
    expect(storage.getItem(CLIENT_SESSION_STORAGE_KEY)).toBe(info.clientId)
  })

  it('reuses an existing client id', () => {
    const storage = createMemoryStorage()
    const first = ensureClientSession(storage)
    const second = ensureClientSession(storage)
    expect(second.clientId).toBe(first.clientId)
  })

  it('returns ephemeral id when storage is unavailable', () => {
    const first = ensureClientSession(null)
    const second = ensureClientSession(null)
    expect(second.clientId).toBe(first.clientId)
  })
})

describe('endClientSession', () => {
  it('clears storage', () => {
    const storage = createMemoryStorage()
    ensureClientSession(storage)
    endClientSession(storage)
    expect(storage.getItem(CLIENT_SESSION_STORAGE_KEY)).toBeNull()
  })

  it('allows a new id after end', () => {
    const storage = createMemoryStorage()
    const first = ensureClientSession(storage)
    endClientSession(storage)
    const second = ensureClientSession(storage)
    expect(second.clientId).not.toBe(first.clientId)
  })
})

describe('maskSessionId', () => {
  it('masks long ids', () => {
    expect(maskSessionId('1234567890abcdef')).toBe('12345678…')
  })

  it('leaves short ids unchanged', () => {
    expect(maskSessionId('abc')).toBe('abc')
  })
})
