import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { ConsentStorePort } from '../../shared/consent/ConsentStorePort'
import { createLocalConsentStore } from '../../shared/consent/localConsentStore'
import { createConsentRecord, type ConsentRecord } from '../../shared/consent/types'
import { loadAdsConfig } from '../../shared/ads/adsConfig'
import { ConsentContext, type ConsentContextValue } from './consentContext'

type Props = {
  children: ReactNode
  store?: ConsentStorePort
}

export function ConsentProvider({ children, store = createLocalConsentStore() }: Props) {
  const adsConfig = useMemo(() => loadAdsConfig(), [])

  const [consent, setConsent] = useState<ConsentRecord | null>(() => store.get())
  const [preferencesOpen, setPreferencesOpen] = useState(false)

  const persist = useCallback(
    (marketing: boolean) => {
      const record = createConsentRecord(marketing)
      store.set(record)
      setConsent(record)
      setPreferencesOpen(false)
    },
    [store],
  )

  const value = useMemo<ConsentContextValue>(
    () => ({
      consent,
      needsChoice: consent === null,
      marketingAllowed: consent?.marketing === true,
      preferencesOpen,
      openPreferences: () => setPreferencesOpen(true),
      closePreferences: () => setPreferencesOpen(false),
      acceptMarketing: () => persist(true),
      rejectMarketing: () => persist(false),
      setMarketing: (marketing) => persist(marketing),
      adsConfig,
    }),
    [adsConfig, consent, persist, preferencesOpen],
  )

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
}
