import { useEffect, useId, useRef } from 'react'
import styles from './ResultModal.module.css'

export type ResultModalProps = {
  open: boolean
  title: string
  text: string
  showSendToRight?: boolean
  downloadFilename?: string
  onCopy: (text: string) => void
  onSend?: (text: string) => void
  onDownload?: (text: string, filename: string) => void
  onClose: () => void
}

export function ResultModal({
  open,
  title,
  text,
  showSendToRight,
  downloadFilename,
  onCopy,
  onSend,
  onDownload,
  onClose,
}: ResultModalProps) {
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <button ref={closeRef} type="button" className={styles.close} onClick={onClose} aria-label="Fechar">
            ×
          </button>
        </header>
        <textarea className={styles.body} value={text} readOnly aria-label={title} />
        <footer className={styles.footer}>
          <button type="button" className={styles.button} onClick={() => onCopy(text)}>
            Copiar
          </button>
          {onDownload && downloadFilename ? (
            <button type="button" className={styles.buttonPrimary} onClick={() => onDownload(text, downloadFilename)}>
              Baixar
            </button>
          ) : null}
          {showSendToRight ? (
            <button type="button" className={styles.buttonPrimary} onClick={() => onSend?.(text)}>
              Enviar à direita
            </button>
          ) : null}
          <button type="button" className={styles.button} onClick={onClose}>
            Fechar
          </button>
        </footer>
      </div>
    </div>
  )
}
