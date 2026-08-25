import { Fragment, useMemo, useState } from 'react'
import { useLocale } from '../../composition/LocaleProvider'
import {
  diffPathSegments,
  formatDiffPreview,
  type DiffEntry,
  type DiffKind,
  type StructuralDiff,
} from '../../shared/json/diff'
import styles from './ComparePanel.module.css'

type Filter = 'all' | DiffKind

type ComparePanelProps = {
  diff?: StructuralDiff | null
  error?: string | null
  onClose: () => void
}

function PathBreadcrumbs({ path }: { path: string }) {
  const { t } = useLocale()
  const segments = diffPathSegments(path)
  return (
    <div className={styles.pathTrail} aria-label={t('compare.path', { path })}>
      {segments.map((segment, index) => (
        <Fragment key={`${path}-${index}`}>
          {index > 0 ? (
            <span className={styles.pathSep} aria-hidden="true">
              ›
            </span>
          ) : null}
          <span className={styles.pathSegment}>{segment}</span>
        </Fragment>
      ))}
    </div>
  )
}

function ValueBlock({
  label,
  value,
  variant,
}: {
  label: string
  value: unknown
  variant: 'left' | 'right' | 'neutral'
}) {
  const { t } = useLocale()
  const full = formatDiffPreview(value, 2000)
  const short = formatDiffPreview(value, 96)
  const truncated = full.length > short.length
  const [expanded, setExpanded] = useState(false)
  const text = expanded ? full : short

  return (
    <div className={`${styles.valueBlock} ${styles[`valueBlock_${variant}`]}`}>
      <span className={styles.valueLabel}>{label}</span>
      <code className={styles.valueCode}>{text}</code>
      {truncated ? (
        <button type="button" className={styles.expand} onClick={() => setExpanded((v) => !v)}>
          {expanded ? t('compare.collapse') : t('compare.expand')}
        </button>
      ) : null}
    </div>
  )
}

function DiffRow({ entry }: { entry: DiffEntry }) {
  const { t } = useLocale()
  return (
    <li className={styles.row} data-kind={entry.kind}>
      <span className={`${styles.badge} ${styles[`badge_${entry.kind}`]}`}>
        {t(`compare.kind.${entry.kind}`)}
      </span>
      <div className={styles.rowBody}>
        <PathBreadcrumbs path={entry.path} />
        {entry.kind === 'changed' ? (
          <div className={styles.valueGrid}>
            <ValueBlock label={t('common.left')} value={entry.left} variant="left" />
            <ValueBlock label={t('common.right')} value={entry.right} variant="right" />
          </div>
        ) : null}
        {entry.kind === 'added' ? (
          <ValueBlock label={t('compare.newValue')} value={entry.right} variant="right" />
        ) : null}
        {entry.kind === 'removed' ? (
          <ValueBlock label={t('compare.removedValue')} value={entry.left} variant="left" />
        ) : null}
      </div>
    </li>
  )
}

export function ComparePanel({ diff, error, onClose }: ComparePanelProps) {
  const { t } = useLocale()
  const [filter, setFilter] = useState<Filter>('all')

  const total = diff ? diff.added + diff.removed + diff.changed : 0
  const identical = diff !== null && diff !== undefined && total === 0 && !error

  const visible = useMemo(() => {
    if (!diff) {
      return []
    }
    const list = filter === 'all' ? diff.entries : diff.entries.filter((e) => e.kind === filter)
    return list.slice(0, 80)
  }, [diff, filter])

  const hiddenCount = useMemo(() => {
    if (!diff) {
      return 0
    }
    const list = filter === 'all' ? diff.entries : diff.entries.filter((e) => e.kind === filter)
    return Math.max(0, list.length - visible.length)
  }, [diff, filter, visible.length])

  return (
    <section className={styles.panel} aria-label={t('compare.aria')}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>{t('compare.title')}</h2>
          <p className={styles.subtitle}>{t('compare.subtitle')}</p>
        </div>
        <button type="button" className={styles.close} onClick={onClose}>
          {t('common.close')}
        </button>
      </header>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      {!error && identical ? (
        <p className={styles.identical} role="status">
          {t('compare.identical')}
        </p>
      ) : null}

      {!error && diff && total > 0 ? (
        <>
          <ul className={styles.chips} aria-label={t('compare.summary')}>
            <li className={styles.chipTotal}>
              <strong>{total}</strong>
              <span>{t('compare.diff')}</span>
            </li>
            <li className={styles.chipAdded}>
              <strong>{diff.added}</strong>
              <span>{t('compare.added')}</span>
            </li>
            <li className={styles.chipRemoved}>
              <strong>{diff.removed}</strong>
              <span>{t('compare.removed')}</span>
            </li>
            <li className={styles.chipChanged}>
              <strong>{diff.changed}</strong>
              <span>{t('compare.changed')}</span>
            </li>
          </ul>

          <div className={styles.filters} role="tablist" aria-label={t('compare.filter')}>
            {(
              [
                ['all', 'compare.all', total],
                ['added', 'compare.filterAdded', diff.added],
                ['removed', 'compare.filterRemoved', diff.removed],
                ['changed', 'compare.filterChanged', diff.changed],
              ] as const
            ).map(([id, labelKey, count]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={filter === id}
                className={`${styles.filter} ${filter === id ? styles.filterActive : ''}`}
                onClick={() => setFilter(id)}
              >
                {t(labelKey)} ({count})
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <p className={styles.empty}>{t('compare.empty')}</p>
          ) : (
            <ul className={styles.list}>
              {visible.map((entry) => (
                <DiffRow key={`${entry.kind}-${entry.path}`} entry={entry} />
              ))}
            </ul>
          )}

          {hiddenCount > 0 ? (
            <p className={styles.more}>{t('compare.more', { count: hiddenCount })}</p>
          ) : null}
        </>
      ) : null}
    </section>
  )
}
