import type { ConsentStorePort } from './ConsentStorePort'
import {
  CONSENT_STORAGE_KEY,
  isConsentCurrent,
  parseConsentRecord,
  type ConsentRecord,
} from './types'

const CONSENT_COOKIE = 'jsonmais_consent'

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

function writeEssentialCookie(record: ConsentRecord): void {
  if (typeof document === 'undefined') return
  const payload = encodeURIComponent(JSON.stringify(record))
  const secure = typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${CONSENT_COOKIE}=${payload}; Path=/; SameSite=Lax; Max-Age=31536000${secure}`
}

function clearEssentialCookie(): void {
  if (typeof document === 'undefined') return
  document.cookie = `${CONSENT_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`
}

function readFromStorage(): ConsentRecord | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!raw) return null
    return parseConsentRecord(JSON.parse(raw))
  } catch {
    return null
  }
}

function readFromCookie(): ConsentRecord | null {
  const raw = readCookie(CONSENT_COOKIE)
  if (!raw) return null
  try {
    return parseConsentRecord(JSON.parse(raw))
  } catch {
    return null
  }
}

export function createLocalConsentStore(): ConsentStorePort {
  return {
    get() {
      const fromStorage = readFromStorage()
      if (fromStorage && isConsentCurrent(fromStorage)) return fromStorage

      const fromCookie = readFromCookie()
      if (fromCookie && isConsentCurrent(fromCookie)) {
        try {
          localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(fromCookie))
        } catch {
          /* ignore quota */
        }
        return fromCookie
      }

      return null
    },
    set(record) {
      const payload = JSON.stringify(record)
      try {
        localStorage.setItem(CONSENT_STORAGE_KEY, payload)
      } catch {
        /* ignore quota */
      }
      writeEssentialCookie(record)
    },
    clear() {
      try {
        localStorage.removeItem(CONSENT_STORAGE_KEY)
      } catch {
        /* ignore */
      }
      clearEssentialCookie()
    },
  }
}
