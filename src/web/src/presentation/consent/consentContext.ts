import { createContext, useContext } from 'react'
import type { AdsConfig } from '../../shared/ads/adsConfig'
import type { ConsentRecord } from '../../shared/consent/types'

export type ConsentContextValue = {
  consent: ConsentRecord | null
  needsChoice: boolean
  marketingAllowed: boolean
  preferencesOpen: boolean
  openPreferences: () => void
  closePreferences: () => void
  acceptMarketing: () => void
  rejectMarketing: () => void
  setMarketing: (marketing: boolean) => void
  adsConfig: AdsConfig
}

export const ConsentContext = createContext<ConsentContextValue | null>(null)

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext)
  if (!ctx) {
    throw new Error('useConsent must be used within ConsentProvider')
  }
  return ctx
}
