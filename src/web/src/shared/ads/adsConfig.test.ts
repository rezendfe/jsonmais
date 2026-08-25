import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { loadAdsConfig, type AdsEnv } from './adsConfig'
import { fetchAdCreative } from './fetchAdCreative'
import {
  clearAdSlotClaims,
  creativeFingerprint,
  fetchUniqueAdCreativeForSlot,
  releaseAdSlotClaim,
} from './uniqueAdCreative'

function env(partial: AdsEnv): AdsEnv {
  return { ...partial }
}

function creativeResponse(id: string, click = `https://ads.example/${id}`) {
  return new Response(
    JSON.stringify({
      advertisementId: id,
      html: `<html>${id}</html>`,
      clickUrl: click,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  )
}

describe('adsConfig', () => {
  it('disables when VITE_ADS_ENABLED is false', () => {
    const config = loadAdsConfig(env({ VITE_ADS_ENABLED: 'false' }))
    expect(config.enabled).toBe(false)
  })

  it('enables when VITE_ADS_ENABLED is true', () => {
    const config = loadAdsConfig(env({ VITE_ADS_ENABLED: 'true' }))
    expect(config.enabled).toBe(true)
  })
})

describe('fetchAdCreative', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.stubGlobal('fetch', originalFetch)
  })

  it('returns null on 204 soft-fail', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 204 }))
    await expect(fetchAdCreative()).resolves.toBeNull()
  })

  it('returns creative on 200', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          advertisementId: 'a1',
          html: '<html></html>',
          clickUrl: 'https://ads.example/click',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )
    const creative = await fetchAdCreative()
    expect(creative).toEqual({
      advertisementId: 'a1',
      categoryId: null,
      html: '<html></html>',
      clickUrl: 'https://ads.example/click',
    })
  })

  it('returns null on network error', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('offline'))
    await expect(fetchAdCreative()).resolves.toBeNull()
  })
})

describe('fetchUniqueAdCreativeForSlot', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    clearAdSlotClaims()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    clearAdSlotClaims()
    vi.stubGlobal('fetch', originalFetch)
  })

  it('retries when the same advertisementId is already claimed', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(creativeResponse('same'))
      .mockResolvedValueOnce(creativeResponse('same'))
      .mockResolvedValueOnce(creativeResponse('other'))

    const first = await fetchUniqueAdCreativeForSlot('bottom_left')
    const second = await fetchUniqueAdCreativeForSlot('bottom_right')

    expect(first?.advertisementId).toBe('same')
    expect(second?.advertisementId).toBe('other')
    expect(vi.mocked(fetch).mock.calls.length).toBeGreaterThanOrEqual(3)
  })

  it('treats identical clickUrl as duplicate even with different ids', async () => {
    const click = 'https://ads.example/same-landing'
    vi.mocked(fetch)
      .mockResolvedValueOnce(creativeResponse('a', click))
      .mockResolvedValueOnce(creativeResponse('b', click))
      .mockResolvedValueOnce(creativeResponse('c', 'https://ads.example/other'))

    const first = await fetchUniqueAdCreativeForSlot('bottom_left')
    const second = await fetchUniqueAdCreativeForSlot('bottom_right')

    expect(first?.advertisementId).toBe('a')
    expect(second?.advertisementId).toBe('c')
    expect(creativeFingerprint(first!)).not.toBe(creativeFingerprint(second!))
  })

  it('releases claim so the same creative can be reused later', async () => {
    vi.mocked(fetch).mockImplementation(() => Promise.resolve(creativeResponse('solo')))

    const first = await fetchUniqueAdCreativeForSlot('bottom_left')
    expect(first?.advertisementId).toBe('solo')
    releaseAdSlotClaim('bottom_left')

    const again = await fetchUniqueAdCreativeForSlot('bottom_right')
    expect(again?.advertisementId).toBe('solo')
  })
})
