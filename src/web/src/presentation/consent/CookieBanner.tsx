import { useEffect, useId, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useConsent } from './consentContext'
import styles from './CookieBanner.module.css'

export function CookieBanner() {
  const {
    needsChoice,
    preferencesOpen,
    acceptMarketing,
    rejectMarketing,
    openPreferences,
    closePreferences,
    setMarketing,
    consent,
  } = useConsent()

  const showBanner = needsChoice && !preferencesOpen
  const titleId = useId()
  const firstFocusRef = useRef<HTMLButtonElement>(null)
  const toggleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (preferencesOpen) {
      toggleRef.current?.focus()
      return
    }
    if (showBanner) firstFocusRef.current?.focus()
  }, [showBanner, preferencesOpen])

  useEffect(() => {
    if (!preferencesOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !needsChoice) closePreferences()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closePreferences, needsChoice, preferencesOpen])

  if (!showBanner && !preferencesOpen) return null

  if (preferencesOpen) {
    const marketing = consent?.marketing ?? false
    return (
      <div className={styles.overlay} role="presentation">
        <div
          className={styles.dialog}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <h2 id={titleId} className={styles.title}>
            Preferências de cookies
          </h2>
          <p className={styles.text}>
            Essenciais mantêm o identificador anônimo local e a preferência de consentimento.
            Marketing permite cookies e scripts de anúncios personalizados.
          </p>
          <ul className={styles.categories}>
            <li>
              <div>
                <strong>Essenciais</strong>
                <span>Sempre ativos · operação do site</span>
              </div>
              <span className={styles.locked} aria-label="Sempre ativos">
                On
              </span>
            </li>
            <li>
              <div>
                <strong>Marketing</strong>
                <span>Anúncios e cookies de direcionamento</span>
              </div>
              <label className={styles.switch}>
                <input
                  ref={toggleRef}
                  type="checkbox"
                  checked={marketing}
                  aria-label="Cookies de marketing"
                  onChange={(e) => setMarketing(e.target.checked)}
                />
                <span className={styles.switchLabel}>{marketing ? 'Ativado' : 'Desativado'}</span>
              </label>
            </li>
          </ul>
          <p className={styles.links}>
            <Link to="/privacidade" onClick={closePreferences}>
              Privacidade
            </Link>
            {' · '}
            <Link to="/cookies" onClick={closePreferences}>
              Cookies
            </Link>
          </p>
          <div className={styles.actions}>
            {!needsChoice && (
              <button type="button" className={styles.secondary} onClick={closePreferences}>
                Fechar
              </button>
            )}
            <button type="button" className={styles.secondary} onClick={rejectMarketing}>
              Rejeitar marketing
            </button>
            <button type="button" className={styles.primary} onClick={acceptMarketing}>
              Aceitar marketing
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.banner} role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className={styles.bannerInner}>
        <h2 id={titleId} className={styles.title}>
          Cookies e anúncios
        </h2>
        <p className={styles.text}>
          Usamos cookies essenciais para o funcionamento local do portal. Cookies de marketing e
          anúncios só após o seu aceite. Você pode rejeitar e continuar editando JSON.
        </p>
        <p className={styles.links}>
          <Link to="/privacidade">Privacidade</Link>
          {' · '}
          <Link to="/cookies">Cookies</Link>
        </p>
        <div className={styles.actions}>
          <button
            ref={firstFocusRef}
            type="button"
            className={styles.secondary}
            onClick={openPreferences}
          >
            Gerenciar
          </button>
          <button type="button" className={styles.secondary} onClick={rejectMarketing}>
            Rejeitar
          </button>
          <button type="button" className={styles.primary} onClick={acceptMarketing}>
            Aceitar
          </button>
        </div>
      </div>
    </div>
  )
}
