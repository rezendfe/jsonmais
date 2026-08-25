import { describe, expect, it } from 'vitest'
import { createConsentRecord, isConsentCurrent, parseConsentRecord } from './types'

describe('consent types', () => {
  it('creates a current marketing record', () => {
    const record = createConsentRecord(true)
    expect(record.essential).toBe(true)
    expect(record.marketing).toBe(true)
    expect(isConsentCurrent(record)).toBe(true)
  })

  it('parses valid payloads and rejects garbage', () => {
    const ok = createConsentRecord(false)
    expect(parseConsentRecord(ok)).toEqual(ok)
    expect(parseConsentRecord({ essential: true })).toBeNull()
    expect(parseConsentRecord(null)).toBeNull()
  })
})
