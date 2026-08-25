export type ThemePreference = 'light' | 'dark'

const STORAGE_KEY = 'jsonmais.theme.v1'

export function readThemePreference(storage: Storage): ThemePreference {
  const raw = storage.getItem(STORAGE_KEY)
  if (raw === 'light' || raw === 'dark') return raw
  return 'light'
}

export function writeThemePreference(storage: Storage, value: ThemePreference): void {
  storage.setItem(STORAGE_KEY, value)
}

export function applyThemeToDocument(theme: ThemePreference): void {
  document.documentElement.dataset.theme = theme
}
