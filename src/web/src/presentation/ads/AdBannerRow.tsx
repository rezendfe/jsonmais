import type { AdSlotId } from '../../shared/ads/adsConfig'
import { AdSlot } from './AdSlot'
import styles from './AdBannerRow.module.css'

type Props = {
  leftSlotId: AdSlotId
  rightSlotId: AdSlotId
  label: string
}

/** Two banners side by side when creatives fill; empty slots render nothing. */
export function AdBannerRow({ leftSlotId, rightSlotId, label }: Props) {
  return (
    <div className={styles.row} role="group" aria-label={label}>
      <AdSlot slotId={leftSlotId} />
      <AdSlot slotId={rightSlotId} />
    </div>
  )
}
