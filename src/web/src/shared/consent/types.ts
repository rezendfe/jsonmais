export type ConsentRecord = {
  essential: true
  marketing: boolean
  updatedAt: string
  version: string
}

export const CONSENT_POLICY_VERSION = '1'

export const CONSENT_STORAGE_KEY = 'jsonmais.consent'

export function createConsentRecord(marketing: boolean, now = new Date()): ConsentRecord {
  return {
    essential: true,
    marketing,
    updatedAt: now.toISOString(),
    version: CONSENT_POLICY_VERSION,
  }
}

export function parseConsentRecord(raw: unknown): ConsentRecord | null {
  if (!raw || typeof raw !== 'object') return null
  const value = raw as Record<string, unknown>
  if (value.essential !== true) return null
  if (typeof value.marketing !== 'boolean') return null
  if (typeof value.updatedAt !== 'string') return null
  if (typeof value.version !== 'string') return null
  return {
    essential: true,
    marketing: value.marketing,
    updatedAt: value.updatedAt,
    version: value.version,
  }
}

export function isConsentCurrent(record: ConsentRecord): boolean {
  return record.version === CONSENT_POLICY_VERSION
}
