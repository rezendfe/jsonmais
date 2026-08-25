import { Link } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import { useLocale } from '../../composition/LocaleProvider'
import {
  endClientSession,
  ensureClientSession,
  maskSessionId,
} from '../../shared/session/clientSession'
import { clearWorkspaceFromLocalStorage } from '../../shared/json/store'
import styles from './TrustPages.module.css'

const FAQ_KEYS = [
  { q: 'how.faq1.q', a: 'how.faq1.a' },
  { q: 'how.faq2.q', a: 'how.faq2.a' },
  { q: 'how.faq3.q', a: 'how.faq3.a' },
  { q: 'how.faq4.q', a: 'how.faq4.a' },
  { q: 'how.faq5.q', a: 'how.faq5.a' },
] as const

export function AboutPage() {
  const { t } = useLocale()
  return (
    <article className={styles.page}>
      <p className={styles.brandSignal}>JSON Mais</p>
      <h1>{t('about.title')}</h1>
      <p className={styles.lead}>{t('about.lead')}</p>
      <p>{t('about.p1')}</p>
      <Link className={styles.cta} to="/">
        {t('common.openEditor')}
      </Link>
    </article>
  )
}

export function HowItWorksPage() {
  const { t } = useLocale()
  return (
    <article className={styles.page}>
      <p className={styles.brandSignal}>JSON Mais</p>
      <h1>{t('how.title')}</h1>
      <p className={styles.lead}>{t('how.lead')}</p>

      <ol className={styles.steps}>
        <li>
          <span className={styles.stepNum}>1</span>
          <div>
            <h2>{t('how.s1.title')}</h2>
            <p>{t('how.s1.body')}</p>
          </div>
        </li>
        <li>
          <span className={styles.stepNum}>2</span>
          <div>
            <h2>{t('how.s2.title')}</h2>
            <p>{t('how.s2.body')}</p>
          </div>
        </li>
        <li>
          <span className={styles.stepNum}>3</span>
          <div>
            <h2>{t('how.s3.title')}</h2>
            <p>
              {t('how.s3.bodya')} <Link to="/ferramentas">{t('how.s3.bodyb')}</Link>.
            </p>
          </div>
        </li>
      </ol>

      <section className={styles.faq} aria-labelledby="faq-title">
        <h2 id="faq-title">{t('how.faqTitle')}</h2>
        {FAQ_KEYS.map((item) => (
          <details key={item.q} className={styles.faqItem}>
            <summary>{t(item.q)}</summary>
            <p>{t(item.a)}</p>
          </details>
        ))}
      </section>

      <div className={styles.ctaBand}>
        <h2>{t('how.ctaTitle')}</h2>
        <p>{t('how.ctaLead')}</p>
        <Link className={styles.cta} to="/">
          {t('common.openEditor')}
        </Link>
      </div>
    </article>
  )
}

export function PrivacyPage() {
  const { t } = useLocale()
  const [clientId, setClientId] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState<'session' | 'local' | null>(null)

  useEffect(() => {
    const info = ensureClientSession(window.localStorage)
    setClientId(info.clientId)
  }, [])

  const onEndSession = useCallback(() => {
    setBusy('session')
    setActionMessage(null)
    endClientSession(window.localStorage)
    setClientId(null)
    setBusy(null)
    setActionMessage(t('privacy.endedMsg'))
  }, [t])

  const onClearLocal = useCallback(() => {
    setBusy('local')
    setActionMessage(null)
    clearWorkspaceFromLocalStorage(window.localStorage)
    setBusy(null)
    setActionMessage(t('privacy.clearedMsg'))
  }, [t])

  return (
    <article className={styles.page}>
      <p className={styles.brandSignal}>JSON Mais</p>
      <h1>{t('privacy.title')}</h1>
      <p className={styles.lead}>{t('privacy.lead')}</p>
      <p>{t('privacy.p1')}</p>

      <section className={styles.privacyPanel} aria-labelledby="privacy-data-title">
        <h2 id="privacy-data-title">{t('privacy.where')}</h2>
        <dl className={styles.privacyList}>
          <div>
            <dt>{t('privacy.doc')}</dt>
            <dd>{t('privacy.docDesc')}</dd>
          </div>
          <div>
            <dt>{t('privacy.id')}</dt>
            <dd>{t('privacy.idDesc')}</dd>
          </div>
          <div>
            <dt>{t('privacy.current')}</dt>
            <dd>
              {clientId ? (
                <code className={styles.sessionCode}>{maskSessionId(clientId)}</code>
              ) : (
                t('privacy.none')
              )}
            </dd>
          </div>
        </dl>

        <div className={styles.privacyActions}>
          <button
            type="button"
            className={styles.secondaryButton}
            disabled={busy !== null}
            onClick={onEndSession}
          >
            {busy === 'session' ? t('privacy.ending') : t('privacy.endSession')}
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            disabled={busy !== null}
            onClick={onClearLocal}
          >
            {busy === 'local' ? t('privacy.clearing') : t('privacy.clearLocal')}
          </button>
        </div>

        {actionMessage ? (
          <p className={styles.actionMessage} role="status">
            {actionMessage}
          </p>
        ) : null}
      </section>

      <p>
        {t('privacy.cookies')}{' '}
        <Link to="/cookies">{t('cookies.title')}</Link>.
      </p>
      <Link className={styles.cta} to="/">
        {t('privacy.back')}
      </Link>
    </article>
  )
}

export function CookiesPage() {
  const { t } = useLocale()
  return (
    <article className={styles.page}>
      <p className={styles.brandSignal}>JSON Mais</p>
      <h1>{t('cookies.title')}</h1>
      <p className={styles.lead}>{t('cookies.lead')}</p>
      <p>{t('cookies.p1')}</p>
      <p>{t('cookies.p2')}</p>
      <p>
        {t('cookies.p3a')} <strong>{t('cookies.manage')}</strong> {t('cookies.p3b')}{' '}
        <Link to="/privacidade">{t('shell.footer.privacy')}</Link>.
      </p>
      <Link className={styles.cta} to="/">
        {t('privacy.back')}
      </Link>
    </article>
  )
}
