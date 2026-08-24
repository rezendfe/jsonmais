export type ThemePreference = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'jsonmais.theme.v1'

export function readThemePreference(storage: Storage): ThemePreference {
  const raw = storage.getItem(STORAGE_KEY)
  if (raw === 'light' || raw === 'dark' || raw === 'system') return raw
  return 'system'
}

export function writeThemePreference(storage: Storage, value: ThemePreference): void {
  storage.setItem(STORAGE_KEY, value)
}

export function resolveTheme(preference: ThemePreference, prefersDark: boolean): 'light' | 'dark' {
  if (preference === 'system') return prefersDark ? 'dark' : 'light'
  return preference
}

export function applyThemeToDocument(theme: 'light' | 'dark'): void {
  document.documentElement.dataset.theme = theme
}
