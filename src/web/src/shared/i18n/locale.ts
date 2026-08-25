export type Locale = 'pt' | 'en'

export const LOCALE_STORAGE_KEY = 'jsonmais.locale.v1'

export function isLocale(value: string | null | undefined): value is Locale {
  return value === 'pt' || value === 'en'
}

/** Primary browser language pt* → pt; otherwise → en */
export function detectBrowserLocale(languages: readonly string[]): Locale {
  const primary = (languages[0] ?? 'en').trim().toLowerCase()
  return primary.startsWith('pt') ? 'pt' : 'en'
}

export function readLocalePreference(storage: Storage | null | undefined): Locale | null {
  if (!storage) return null
  const raw = storage.getItem(LOCALE_STORAGE_KEY)
  return isLocale(raw) ? raw : null
}

export function writeLocalePreference(storage: Storage | null | undefined, locale: Locale): void {
  if (!storage) return
  storage.setItem(LOCALE_STORAGE_KEY, locale)
}

export function resolveLocale(
  storage: Storage | null | undefined,
  languages: readonly string[],
): Locale {
  return readLocalePreference(storage) ?? detectBrowserLocale(languages)
}

export function htmlLang(locale: Locale): string {
  return locale === 'pt' ? 'pt-BR' : 'en'
}

export function applyLocaleToDocument(locale: Locale): void {
  document.documentElement.lang = htmlLang(locale)
  const ogLocale = document.querySelector('meta[property="og:locale"]')
  if (ogLocale) {
    ogLocale.setAttribute('content', locale === 'pt' ? 'pt_BR' : 'en_US')
  }
}
