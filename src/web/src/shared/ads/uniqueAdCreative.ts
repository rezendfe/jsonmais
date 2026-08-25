import type { AdSlotId } from './adsConfig'
import { fetchAdCreative, type AdCreative } from './fetchAdCreative'

type Claim = {
  advertisementId: string
  clickUrl: string
}

export function creativeFingerprint(creative: AdCreative): string {
  return `${normalize(creative.advertisementId)}|${normalize(creative.clickUrl)}`
}

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

const claimsBySlot = new Map<AdSlotId, Claim>()

/** Serialize slot claims so parallel AdSlots cannot race the same creative. */
let claimChain: Promise<unknown> = Promise.resolve()

const MAX_ATTEMPTS = 8

function isDuplicateOfClaimed(slotId: AdSlotId, creative: AdCreative): boolean {
  const id = normalize(creative.advertisementId)
  const click = normalize(creative.clickUrl)

  for (const [otherSlot, claimed] of claimsBySlot) {
    if (otherSlot === slotId) continue
    if (claimed.advertisementId === id || claimed.clickUrl === click) {
      return true
    }
  }

  return false
}

/**
 * Fetches a creative unique among currently mounted slots.
 * Retries the Ads proxy when advertisementId or clickUrl matches another slot.
 */
export async function fetchUniqueAdCreativeForSlot(
  slotId: AdSlotId,
  signal?: AbortSignal,
): Promise<AdCreative | null> {
  const run = claimChain.then(async () => {
    claimsBySlot.delete(slotId)

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      if (signal?.aborted) {
        return null
      }

      const creative = await fetchAdCreative(signal)
      if (!creative) {
        return null
      }

      if (isDuplicateOfClaimed(slotId, creative)) {
        continue
      }

      claimsBySlot.set(slotId, {
        advertisementId: normalize(creative.advertisementId),
        clickUrl: normalize(creative.clickUrl),
      })
      return creative
    }

    return null
  })

  claimChain = run.then(
    () => undefined,
    () => undefined,
  )

  return run
}

export function releaseAdSlotClaim(slotId: AdSlotId): void {
  claimsBySlot.delete(slotId)
}

/** Test / soft-reset helper. */
export function clearAdSlotClaims(): void {
  claimsBySlot.clear()
  claimChain = Promise.resolve()
}
