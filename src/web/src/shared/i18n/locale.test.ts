import { afterEach, describe, expect, it } from 'vitest'
import {
  LOCALE_STORAGE_KEY,
  detectBrowserLocale,
  readLocalePreference,
  resolveLocale,
  writeLocalePreference,
} from './locale'

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

describe('detectBrowserLocale', () => {
  it('prefers Portuguese when present', () => {
    expect(detectBrowserLocale(['pt-BR', 'en-US'])).toBe('pt')
    expect(detectBrowserLocale(['pt'])).toBe('pt')
  })

  it('falls back to English for non-pt browsers', () => {
    expect(detectBrowserLocale(['en-US'])).toBe('en')
    expect(detectBrowserLocale(['de-DE', 'fr-FR'])).toBe('en')
  })
})

describe('locale preference', () => {
  afterEach(() => {
    // no global storage
  })

  it('reads and writes preference', () => {
    const storage = createMemoryStorage()
    expect(readLocalePreference(storage)).toBeNull()
    writeLocalePreference(storage, 'en')
    expect(storage.getItem(LOCALE_STORAGE_KEY)).toBe('en')
    expect(readLocalePreference(storage)).toBe('en')
  })

  it('resolveLocale prefers stored over browser', () => {
    const storage = createMemoryStorage()
    writeLocalePreference(storage, 'en')
    expect(resolveLocale(storage, ['pt-BR'])).toBe('en')
  })

  it('resolveLocale uses browser when unset', () => {
    const storage = createMemoryStorage()
    expect(resolveLocale(storage, ['pt-BR'])).toBe('pt')
    expect(resolveLocale(storage, ['en-GB'])).toBe('en')
  })
})
