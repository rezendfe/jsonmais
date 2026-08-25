import { useEffect, useId, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useLocale } from '../../composition/LocaleProvider'
import { useConsent } from './consentContext'
import styles from './CookieBanner.module.css'

export function CookieBanner() {
  const { t } = useLocale()
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
            {t('consent.prefsTitle')}
          </h2>
          <p className={styles.text}>{t('consent.prefsBody')}</p>
          <ul className={styles.categories}>
            <li>
              <div>
                <strong>{t('consent.essential')}</strong>
                <span>{t('consent.essentialDesc')}</span>
              </div>
              <span className={styles.locked} aria-label={t('consent.essentialAria')}>
                On
              </span>
            </li>
            <li>
              <div>
                <strong>{t('consent.marketing')}</strong>
                <span>{t('consent.marketingDesc')}</span>
              </div>
              <label className={styles.switch}>
                <input
                  ref={toggleRef}
                  type="checkbox"
                  checked={marketing}
                  aria-label={t('consent.marketingAria')}
                  onChange={(e) => setMarketing(e.target.checked)}
                />
                <span className={styles.switchLabel}>
                  {marketing ? t('consent.on') : t('consent.off')}
                </span>
              </label>
            </li>
          </ul>
          <p className={styles.links}>
            <Link to="/privacidade" onClick={closePreferences}>
              {t('shell.footer.privacy')}
            </Link>
            {' · '}
            <Link to="/cookies" onClick={closePreferences}>
              {t('cookies.title')}
            </Link>
          </p>
          <div className={styles.actions}>
            {!needsChoice && (
              <button type="button" className={styles.secondary} onClick={closePreferences}>
                {t('common.close')}
              </button>
            )}
            <button type="button" className={styles.secondary} onClick={rejectMarketing}>
              {t('consent.rejectMarketing')}
            </button>
            <button type="button" className={styles.primary} onClick={acceptMarketing}>
              {t('consent.acceptMarketing')}
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
          {t('consent.title')}
        </h2>
        <p className={styles.text}>{t('consent.body')}</p>
        <p className={styles.links}>
          <Link to="/privacidade">{t('shell.footer.privacy')}</Link>
          {' · '}
          <Link to="/cookies">{t('cookies.title')}</Link>
        </p>
        <div className={styles.actions}>
          <button
            ref={firstFocusRef}
            type="button"
            className={styles.secondary}
            onClick={openPreferences}
          >
            {t('consent.manage')}
          </button>
          <button type="button" className={styles.secondary} onClick={rejectMarketing}>
            {t('consent.reject')}
          </button>
          <button type="button" className={styles.primary} onClick={acceptMarketing}>
            {t('consent.accept')}
          </button>
        </div>
      </div>
    </div>
  )
}
