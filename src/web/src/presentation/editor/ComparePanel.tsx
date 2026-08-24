import { Fragment, useMemo, useState } from 'react'
import {
  diffPathSegments,
  formatDiffPreview,
  type DiffEntry,
  type DiffKind,
  type StructuralDiff,
} from '../../shared/json/diff'
import styles from './ComparePanel.module.css'

const KIND_LABEL: Record<DiffKind, string> = {
  added: 'Adicionado',
  removed: 'Removido',
  changed: 'Alterado',
}

type Filter = 'all' | DiffKind

type ComparePanelProps = {
  diff?: StructuralDiff | null
  error?: string | null
  onClose: () => void
}

function PathBreadcrumbs({ path }: { path: string }) {
  const segments = diffPathSegments(path)
  return (
    <div className={styles.pathTrail} aria-label={`Caminho: ${path}`}>
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
          {expanded ? 'Ver menos' : 'Ver valor completo'}
        </button>
      ) : null}
    </div>
  )
}

function DiffRow({ entry }: { entry: DiffEntry }) {
  return (
    <li className={styles.row} data-kind={entry.kind}>
      <span className={`${styles.badge} ${styles[`badge_${entry.kind}`]}`}>{KIND_LABEL[entry.kind]}</span>
      <div className={styles.rowBody}>
        <PathBreadcrumbs path={entry.path} />
        {entry.kind === 'changed' ? (
          <div className={styles.valueGrid}>
            <ValueBlock label="Esquerda" value={entry.left} variant="left" />
            <ValueBlock label="Direita" value={entry.right} variant="right" />
          </div>
        ) : null}
        {entry.kind === 'added' ? (
          <ValueBlock label="Novo valor" value={entry.right} variant="right" />
        ) : null}
        {entry.kind === 'removed' ? (
          <ValueBlock label="Valor removido" value={entry.left} variant="left" />
        ) : null}
      </div>
    </li>
  )
}

export function ComparePanel({ diff, error, onClose }: ComparePanelProps) {
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
    <section className={styles.panel} aria-label="Resultado da comparação">
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>Comparar JSON</h2>
          <p className={styles.subtitle}>
            Esquerda → direita · ignora ordem de chaves em objetos
          </p>
        </div>
        <button type="button" className={styles.close} onClick={onClose}>
          Fechar
        </button>
      </header>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      {!error && identical ? (
        <p className={styles.identical} role="status">
          Os documentos são equivalentes — mesma estrutura e mesmos valores.
        </p>
      ) : null}

      {!error && diff && total > 0 ? (
        <>
          <ul className={styles.chips} aria-label="Resumo">
            <li className={styles.chipTotal}>
              <strong>{total}</strong>
              <span>diferenças</span>
            </li>
            <li className={styles.chipAdded}>
              <strong>{diff.added}</strong>
              <span>adicionados</span>
            </li>
            <li className={styles.chipRemoved}>
              <strong>{diff.removed}</strong>
              <span>removidos</span>
            </li>
            <li className={styles.chipChanged}>
              <strong>{diff.changed}</strong>
              <span>alterados</span>
            </li>
          </ul>

          <div className={styles.filters} role="tablist" aria-label="Filtrar diferenças">
            {(
              [
                ['all', 'Todos', total],
                ['added', 'Adicionados', diff.added],
                ['removed', 'Removidos', diff.removed],
                ['changed', 'Alterados', diff.changed],
              ] as const
            ).map(([id, label, count]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={filter === id}
                className={`${styles.filter} ${filter === id ? styles.filterActive : ''}`}
                onClick={() => setFilter(id)}
              >
                {label} ({count})
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <p className={styles.empty}>Nenhuma diferença neste filtro.</p>
          ) : (
            <ul className={styles.list}>
              {visible.map((entry) => (
                <DiffRow key={`${entry.kind}-${entry.path}`} entry={entry} />
              ))}
            </ul>
          )}

          {hiddenCount > 0 ? (
            <p className={styles.more}>… e mais {hiddenCount} diferenças</p>
          ) : null}
        </>
      ) : null}
    </section>
  )
}
