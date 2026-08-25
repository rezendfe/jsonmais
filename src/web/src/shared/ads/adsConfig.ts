export type AdSlotId = 'bottom_left' | 'bottom_right'

export type AdsConfig = {
  enabled: boolean
}

export type AdsEnv = {
  VITE_ADS_ENABLED?: string
}

function readFlag(value: string | undefined): boolean {
  if (!value) return false
  return value === '1' || value.toLowerCase() === 'true'
}

export function loadAdsConfig(env: AdsEnv = import.meta.env): AdsConfig {
  return {
    enabled: readFlag(env.VITE_ADS_ENABLED),
  }
}
