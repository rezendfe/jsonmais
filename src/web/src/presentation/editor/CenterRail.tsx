import styles from './CenterRail.module.css'

type CenterRailProps = {
  compareActive: boolean
  onCopyLeft: () => void
  onCopyRight: () => void
  onTransformLeft: () => void
  onTransformRight: () => void
  onCompare: () => void
}

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path
        d="M10.2 3.2 5.4 8l4.8 4.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path
        d="M5.8 3.2 10.6 8 5.8 12.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CompareIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <rect x="2" y="2" width="12" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

export function CenterRail({
  compareActive,
  onCopyLeft,
  onCopyRight,
  onTransformLeft,
  onTransformRight,
  onCompare,
}: CenterRailProps) {
  return (
    <div className={styles.rail} role="toolbar" aria-label="Operações entre painéis">
      <section className={styles.group} aria-labelledby="rail-copy">
        <h2 id="rail-copy" className={styles.label}>
          Copiar
        </h2>
        <div className={styles.row}>
          <button
            type="button"
            className={styles.iconButton}
            title="Copiar direita para a esquerda"
            aria-label="Copiar direita para a esquerda"
            onClick={onCopyLeft}
          >
            <ChevronLeftIcon />
          </button>
          <button
            type="button"
            className={styles.iconButton}
            title="Copiar esquerda para a direita"
            aria-label="Copiar esquerda para a direita"
            onClick={onCopyRight}
          >
            <ChevronRightIcon />
          </button>
        </div>
      </section>

      <section className={styles.group} aria-labelledby="rail-transform">
        <h2 id="rail-transform" className={styles.label}>
          Transformar
        </h2>
        <div className={styles.row}>
          <button
            type="button"
            className={styles.iconButton}
            title="Transformar a direita e gravar à esquerda"
            aria-label="Transformar a direita e gravar à esquerda"
            onClick={onTransformLeft}
          >
            <ChevronLeftIcon />
          </button>
          <button
            type="button"
            className={styles.iconButton}
            title="Transformar a esquerda e gravar à direita"
            aria-label="Transformar a esquerda e gravar à direita"
            onClick={onTransformRight}
          >
            <ChevronRightIcon />
          </button>
        </div>
      </section>

      <section className={styles.group} aria-labelledby="rail-diff">
        <h2 id="rail-diff" className={styles.label}>
          Diferenças
        </h2>
        <button
          type="button"
          className={`${styles.compareButton} ${compareActive ? styles.compareActive : ''}`}
          aria-pressed={compareActive}
          title="Comparar estrutura dos dois documentos"
          onClick={onCompare}
        >
          <CompareIcon />
          Comparar
        </button>
      </section>
    </div>
  )
}
