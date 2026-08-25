import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  applyLocaleToDocument,
  resolveLocale,
  translate,
  writeLocalePreference,
  type Locale,
  type MessageKey,
} from '../shared/i18n'

type LocaleContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: MessageKey, params?: Record<string, string | number>) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

function browserLanguages(): string[] {
  if (typeof navigator === 'undefined') return ['en']
  if (navigator.languages?.length) return [...navigator.languages]
  return navigator.language ? [navigator.language] : ['en']
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() =>
    resolveLocale(
      typeof window !== 'undefined' ? window.localStorage : null,
      browserLanguages(),
    ),
  )

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    writeLocalePreference(window.localStorage, next)
  }, [])

  const t = useCallback(
    (key: MessageKey, params?: Record<string, string | number>) => translate(locale, key, params),
    [locale],
  )

  useEffect(() => {
    applyLocaleToDocument(locale)
  }, [locale])

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t])

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext)
  if (!ctx) {
    throw new Error('useLocale must be used within LocaleProvider')
  }
  return ctx
}
