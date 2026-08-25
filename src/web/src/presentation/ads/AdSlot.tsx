import { useEffect, useState } from 'react'
import type { AdSlotId } from '../../shared/ads/adsConfig'
import type { AdCreative } from '../../shared/ads/fetchAdCreative'
import {
  fetchUniqueAdCreativeForSlot,
  releaseAdSlotClaim,
} from '../../shared/ads/uniqueAdCreative'
import { useConsent } from '../consent/consentContext'
import styles from './AdSlot.module.css'

type Props = {
  slotId: AdSlotId
}

/** Force creative document to stretch to the iframe (slot) size. */
const FILL_SLOT_STYLE =
  '<style id="jsonmais-fill-slot">html,body{width:100%!important;height:100%!important;margin:0!important;padding:0!important;overflow:hidden!important}.banner{width:100%!important;height:100%!important;max-width:none!important;max-height:none!important}</style>'

function htmlFillingSlot(html: string): string {
  if (html.includes('id="jsonmais-fill-slot"')) return html
  if (/<\/head>/i.test(html)) {
    return html.replace(/<\/head>/i, `${FILL_SLOT_STYLE}</head>`)
  }
  return `${FILL_SLOT_STYLE}${html}`
}

/**
 * Renders only when a creative is available (no empty frame).
 * Creative loads only after marketing consent — never blocks the editor.
 */
export function AdSlot({ slotId }: Props) {
  const { adsConfig, marketingAllowed } = useConsent()
  const [creative, setCreative] = useState<AdCreative | null>(null)
  const canLoad = marketingAllowed && adsConfig.enabled

  useEffect(() => {
    if (!canLoad) {
      releaseAdSlotClaim(slotId)
      setCreative(null)
      return
    }

    const controller = new AbortController()
    let cancelled = false

    void (async () => {
      const result = await fetchUniqueAdCreativeForSlot(slotId, controller.signal)
      if (!cancelled) {
        setCreative(result)
      }
    })()

    return () => {
      cancelled = true
      controller.abort()
      releaseAdSlotClaim(slotId)
    }
  }, [canLoad, slotId])

  const openAd = () => {
    if (!creative?.clickUrl) return
    window.open(creative.clickUrl, '_blank', 'noopener,noreferrer')
  }

  if (!canLoad || !creative) {
    return null
  }

  return (
    <aside className={styles.slot} aria-label="Anúncio" data-ad-slot={slotId}>
      <button
        type="button"
        className={styles.clickable}
        onClick={openAd}
        aria-label="Abrir anúncio em nova janela"
      >
        <iframe
          className={styles.preview}
          title="Anúncio"
          srcDoc={htmlFillingSlot(creative.html)}
          sandbox="allow-scripts"
          tabIndex={-1}
          loading="lazy"
        />
      </button>
    </aside>
  )
}
