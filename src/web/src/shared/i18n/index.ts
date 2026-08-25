import { catalogs, type MessageKey } from './messages'
import type { Locale } from './locale'

export type { MessageKey } from './messages'
export type { Locale } from './locale'
export {
  LOCALE_STORAGE_KEY,
  applyLocaleToDocument,
  detectBrowserLocale,
  htmlLang,
  isLocale,
  readLocalePreference,
  resolveLocale,
  writeLocalePreference,
} from './locale'

export function translate(
  locale: Locale,
  key: MessageKey,
  params?: Record<string, string | number>,
): string {
  const template = catalogs[locale][key] ?? catalogs.pt[key] ?? String(key)
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    params[name] !== undefined ? String(params[name]) : `{${name}}`,
  )
}
