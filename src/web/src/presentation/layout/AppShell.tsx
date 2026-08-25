import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useLocale } from '../../composition/LocaleProvider'
import type { Locale } from '../../shared/i18n'
import { ensureClientSession } from '../../shared/session/clientSession'
import {
  applyThemeToDocument,
  readThemePreference,
  writeThemePreference,
  type ThemePreference,
} from '../../shared/theme/theme'
import { AdBannerRow } from '../ads/AdBannerRow'
import { CookieBanner } from '../consent/CookieBanner'
import { useConsent } from '../consent/consentContext'
import { TOOL_CATALOG, toolTitleKey } from '../pages/toolCatalog'
import styles from './AppShell.module.css'

const FOOTER_TOOLS = TOOL_CATALOG.slice(0, 6)

export function AppShell() {
  const location = useLocation()
  const isEditor = location.pathname === '/'
  const [themePref, setThemePref] = useState<ThemePreference>('light')
  const headerRef = useRef<HTMLElement>(null)
  const { openPreferences } = useConsent()
  const { locale, setLocale, t } = useLocale()

  useEffect(() => {
    ensureClientSession(window.localStorage)
  }, [])

  useEffect(() => {
    const preference = readThemePreference(window.localStorage)
    setThemePref(preference)
  }, [])

  useEffect(() => {
    applyThemeToDocument(themePref)
    writeThemePreference(window.localStorage, themePref)
  }, [themePref])

  useEffect(() => {
    const header = headerRef.current
    if (!header) {
      return
    }
    const syncHeaderHeight = () => {
      const height = Math.ceil(header.getBoundingClientRect().height)
      document.documentElement.style.setProperty('--header-h', `${height}px`)
    }
    syncHeaderHeight()
    const observer = new ResizeObserver(syncHeaderHeight)
    observer.observe(header)
    window.addEventListener('resize', syncHeaderHeight)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', syncHeaderHeight)
    }
  }, [isEditor, themePref, locale])

  return (
    <div className={`${styles.shell} ${isEditor ? styles.shellEditor : styles.shellMarketing}`}>
      <header className={styles.header} ref={headerRef}>
        <div className={styles.headerInner}>
          <Link className={styles.brandLink} to="/" aria-label="JSon+">
            <img
              className={styles.logo}
              src="/logo.png"
              alt="JSon+"
              width={120}
              height={93}
            />
          </Link>
          <nav className={styles.nav} aria-label={t('shell.nav.main')}>
            <Link className={styles.navLink} to="/">
              {t('shell.nav.editor')}
            </Link>
            <Link className={styles.navLink} to="/ferramentas">
              {t('shell.nav.tools')}
            </Link>
            <Link className={styles.navLink} to="/como-funciona">
              {t('shell.nav.how')}
            </Link>
            <Link className={styles.navLink} to="/sobre">
              {t('shell.nav.about')}
            </Link>
            <label className={styles.themeLabel}>
              <span className={styles.themeText}>{t('shell.theme')}</span>
              <select
                className={styles.themeSelect}
                value={themePref}
                aria-label={t('shell.theme')}
                onChange={(event) => setThemePref(event.target.value as ThemePreference)}
              >
                <option value="light">{t('shell.theme.light')}</option>
                <option value="dark">{t('shell.theme.dark')}</option>
              </select>
            </label>
            <label className={styles.themeLabel}>
              <span className={styles.themeText}>{t('shell.lang')}</span>
              <select
                className={styles.themeSelect}
                value={locale}
                aria-label={t('shell.lang')}
                onChange={(event) => setLocale(event.target.value as Locale)}
              >
                <option value="pt">{t('shell.lang.pt')}</option>
                <option value="en">{t('shell.lang.en')}</option>
              </select>
            </label>
          </nav>
        </div>
      </header>
      <main className={`${styles.main} ${isEditor ? styles.mainWide : styles.mainNarrow}`}>
        <Outlet />
      </main>
      <AdBannerRow
        leftSlotId="bottom_left"
        rightSlotId="bottom_right"
        label={t('shell.ads.bottom')}
      />
      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            <img
              className={styles.footerLogo}
              src="/logo.png"
              alt="JSon+"
              width={123}
              height={96}
            />
            <p className={styles.footerNote}>{t('shell.footer.tagline')}</p>
          </div>
          <div>
            <p className={styles.footerHeading}>{t('shell.footer.product')}</p>
            <nav className={styles.footerCol} aria-label={t('shell.footer.product')}>
              <Link className={styles.footerLink} to="/">
                {t('shell.footer.editor')}
              </Link>
              <Link className={styles.footerLink} to="/ferramentas">
                {t('shell.footer.catalog')}
              </Link>
              <Link className={styles.footerLink} to="/como-funciona">
                {t('shell.footer.how')}
              </Link>
              <Link className={styles.footerLink} to="/sobre">
                {t('shell.footer.about')}
              </Link>
            </nav>
          </div>
          <div>
            <p className={styles.footerHeading}>{t('shell.footer.tools')}</p>
            <nav className={styles.footerCol} aria-label={t('shell.footer.tools')}>
              {FOOTER_TOOLS.map((tool) => (
                <Link key={tool.slug} className={styles.footerLink} to={`/ferramentas/${tool.slug}`}>
                  {t(toolTitleKey(tool.slug))}
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <p className={styles.footerHeading}>{t('shell.footer.legal')}</p>
            <nav className={styles.footerCol} aria-label={t('shell.footer.legal')}>
              <Link className={styles.footerLink} to="/privacidade">
                {t('shell.footer.privacy')}
              </Link>
              <Link className={styles.footerLink} to="/cookies">
                {t('shell.footer.cookies')}
              </Link>
              <button type="button" className={styles.footerButton} onClick={openPreferences}>
                {t('shell.footer.manageCookies')}
              </button>
              <a
                className={styles.footerLink}
                href="https://solucoessimples.com.br"
                rel="noopener noreferrer"
                target="_blank"
              >
                Soluções Simples
              </a>
            </nav>
          </div>
        </div>
        <p className={styles.copyright}>{t('shell.footer.copy', { year: new Date().getFullYear() })}</p>
      </footer>
      <CookieBanner />
    </div>
  )
}
