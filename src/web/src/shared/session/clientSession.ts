export const CLIENT_SESSION_STORAGE_KEY = 'jsonmais_client_id'

export type ClientSessionInfo = {
  clientId: string
}

let ephemeralClientId: string | null = null

function createClientId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function isValidClientId(value: string): boolean {
  return value.trim().length > 0
}

function getDefaultStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function ensureClientSession(storage: Storage | null = getDefaultStorage()): ClientSessionInfo {
  if (storage) {
    try {
      const existing = storage.getItem(CLIENT_SESSION_STORAGE_KEY)
      if (existing && isValidClientId(existing)) {
        return { clientId: existing }
      }
      const clientId = createClientId()
      storage.setItem(CLIENT_SESSION_STORAGE_KEY, clientId)
      return { clientId }
    } catch {
      /* quota / private mode */
    }
  }

  if (!ephemeralClientId) {
    ephemeralClientId = createClientId()
  }
  return { clientId: ephemeralClientId }
}

export function endClientSession(storage: Storage | null = getDefaultStorage()): void {
  ephemeralClientId = null
  if (!storage) {
    return
  }
  try {
    storage.removeItem(CLIENT_SESSION_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

export function maskSessionId(id: string): string {
  if (id.length <= 8) {
    return id
  }
  return `${id.slice(0, 8)}…`
}
