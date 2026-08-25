export type AdCreative = {
  advertisementId: string
  categoryId?: string | null
  html: string
  clickUrl: string
}

/**
 * Fetches a creative via the same-origin SWA proxy (`/api/ads/creative`).
 * Returns null on 204 / soft-fail — caller omits the slot.
 */
export async function fetchAdCreative(signal?: AbortSignal): Promise<AdCreative | null> {
  try {
    const response = await fetch('/api/ads/creative', { method: 'GET', signal })
    if (response.status === 204 || !response.ok) {
      return null
    }
    const body = (await response.json()) as Partial<AdCreative>
    if (!body.advertisementId || !body.html || !body.clickUrl) {
      return null
    }
    return {
      advertisementId: body.advertisementId,
      categoryId: body.categoryId ?? null,
      html: body.html,
      clickUrl: body.clickUrl,
    }
  } catch {
    return null
  }
}
