import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { ensureClientSession } from '../../shared/session/clientSession'
import {
  applyThemeToDocument,
  readThemePreference,
  resolveTheme,
  writeThemePreference,
  type ThemePreference,
} from '../../shared/theme/theme'
import { TOOL_CATALOG } from '../pages/toolCatalog'
import styles from './AppShell.module.css'

const FOOTER_TOOLS = TOOL_CATALOG.slice(0, 6)

export function AppShell() {
  const location = useLocation()
  const isEditor = location.pathname === '/'
  const [themePref, setThemePref] = useState<ThemePreference>('system')
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    ensureClientSession(window.localStorage)
  }, [])

  useEffect(() => {
    const preference = readThemePreference(window.localStorage)
    setThemePref(preference)
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      applyThemeToDocument(resolveTheme(themePref, media.matches))
    }
    apply()
    writeThemePreference(window.localStorage, themePref)
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
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
  }, [isEditor, themePref])

  return (
    <div className={`${styles.shell} ${isEditor ? styles.shellEditor : styles.shellMarketing}`}>
      <header className={styles.header} ref={headerRef}>
        <div className={styles.headerInner}>
          <Link className={styles.brandLink} to="/" aria-label="JSon+">
            <img
              className={styles.logo}
              src="/logo.png"
              alt="JSon+"
              width={80}
              height={62}
            />
          </Link>
          <nav className={styles.nav} aria-label="Principal">
            <Link className={styles.navLink} to="/">
              Editor
            </Link>
            <Link className={styles.navLink} to="/ferramentas">
              Ferramentas
            </Link>
            <Link className={styles.navLink} to="/como-funciona">
              Como funciona
            </Link>
            <Link className={styles.navLink} to="/sobre">
              Sobre
            </Link>
            <label className={styles.themeLabel}>
              <span className={styles.themeText}>Tema</span>
              <select
                className={styles.themeSelect}
                value={themePref}
                aria-label="Tema"
                onChange={(event) => setThemePref(event.target.value as ThemePreference)}
              >
                <option value="system">Sistema</option>
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
              </select>
            </label>
          </nav>
        </div>
      </header>
      <main className={`${styles.main} ${isEditor ? styles.mainWide : styles.mainNarrow}`}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            <img
              className={styles.footerLogo}
              src="/logo.png"
              alt="JSon+"
              width={82}
              height={64}
            />
            <p className={styles.footerNote}>
              Canivete suíço JSON local-first. O documento nunca sai do seu navegador.
            </p>
          </div>
          <div>
            <p className={styles.footerHeading}>Produto</p>
            <nav className={styles.footerCol} aria-label="Produto">
              <Link className={styles.footerLink} to="/">
                Editor dual-panel
              </Link>
              <Link className={styles.footerLink} to="/ferramentas">
                Catálogo de ferramentas
              </Link>
              <Link className={styles.footerLink} to="/como-funciona">
                Como funciona
              </Link>
              <Link className={styles.footerLink} to="/sobre">
                Sobre
              </Link>
            </nav>
          </div>
          <div>
            <p className={styles.footerHeading}>Ferramentas</p>
            <nav className={styles.footerCol} aria-label="Ferramentas">
              {FOOTER_TOOLS.map((tool) => (
                <Link key={tool.slug} className={styles.footerLink} to={`/ferramentas/${tool.slug}`}>
                  {tool.title}
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <p className={styles.footerHeading}>Legal</p>
            <nav className={styles.footerCol} aria-label="Legal">
              <Link className={styles.footerLink} to="/privacidade">
                Privacidade
              </Link>
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
        <p className={styles.copyright}>© {new Date().getFullYear()} Soluções Simples · JSON Mais</p>
      </footer>
    </div>
  )
}
