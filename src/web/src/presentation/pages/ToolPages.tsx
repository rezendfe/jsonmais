import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLocale } from '../../composition/LocaleProvider'
import { SAMPLE_LEFT } from '../../shared/json/sample'
import { ToolboxPanel } from '../toolbox/ToolboxPanel'
import {
  TOOL_CATALOG,
  categoryKey,
  toolBlurbKey,
  toolDescriptionKey,
  toolTitleKey,
  type ToolCategoryId,
  type ToolDef,
} from './toolCatalog'
import styles from './ToolPages.module.css'

export { TOOL_CATALOG } from './toolCatalog'

const CATEGORY_ORDER: ToolCategoryId[] = [
  'analyze',
  'query',
  'schema',
  'transform',
  'security',
  'mock',
  'sql',
  'convert',
  'codegen',
  'api',
]

function toolInitials(title: string): string {
  return (
    title
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || '{ }'
  )
}

function groupByCategory(tools: ToolDef[]): { category: ToolCategoryId; tools: ToolDef[] }[] {
  const map = new Map<ToolCategoryId, ToolDef[]>()
  for (const tool of tools) {
    const list = map.get(tool.category) ?? []
    list.push(tool)
    map.set(tool.category, list)
  }
  return CATEGORY_ORDER.filter((category) => map.has(category)).map((category) => ({
    category,
    tools: map.get(category) ?? [],
  }))
}

function EditorMock() {
  return (
    <div className={styles.mock} aria-hidden="true">
      <div className={styles.mockChrome}>
        <span />
        <span />
        <span />
      </div>
      <div className={styles.mockPanels}>
        <pre className={styles.mockPane}>{`{
  "produto": "JSON Mais",
  "localFirst": true,
  "paineis": ["esquerdo", "direito"]
}`}</pre>
        <div className={styles.mockRail} />
        <pre className={styles.mockPane}>{`{
  "formatado": true,
  "diff": "pronto",
  "schema": "ok"
}`}</pre>
      </div>
    </div>
  )
}

function ToolCard({ tool }: { tool: ToolDef }) {
  const { t } = useLocale()
  const title = t(toolTitleKey(tool.slug))
  return (
    <Link className={styles.card} to={`/ferramentas/${tool.slug}`}>
      <span className={styles.cardIcon} aria-hidden="true">
        {toolInitials(title)}
      </span>
      <span className={styles.cardBody}>
        <span className={styles.cardCategory}>{t(categoryKey(tool.category))}</span>
        <strong className={styles.cardTitle}>{title}</strong>
        <span className={styles.cardDesc}>{t(toolDescriptionKey(tool.slug))}</span>
      </span>
    </Link>
  )
}

export function ToolsIndexPage() {
  const { t } = useLocale()
  const groups = useMemo(() => groupByCategory(TOOL_CATALOG), [])
  const chips = [
    t('hub.chip.tools', { count: TOOL_CATALOG.length }),
    t('hub.chip.browser'),
    t('hub.chip.noSignup'),
    t('hub.chip.local'),
  ]

  return (
    <div className={styles.hub}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.brandSignal}>JSON Mais</p>
          <h1 className={styles.heroTitle}>{t('hub.heroTitle')}</h1>
          <p className={styles.heroLead}>{t('hub.heroLead')}</p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryCta} to="/">
              {t('common.openEditor')}
            </Link>
            <Link className={styles.secondaryCta} to="/como-funciona">
              {t('common.howItWorks')}
            </Link>
          </div>
          <ul className={styles.chips}>
            {chips.map((chip) => (
              <li key={chip}>{chip}</li>
            ))}
          </ul>
        </div>
        <EditorMock />
      </section>

      <section className={styles.catalog}>
        <div className={styles.sectionHead}>
          <h2>{t('hub.catalogTitle')}</h2>
          <p>{t('hub.catalogLead')}</p>
        </div>
        {groups.map((group) => (
          <div key={group.category} className={styles.categoryBlock}>
            <h3 className={styles.categoryTitle}>{t(categoryKey(group.category))}</h3>
            <ul className={styles.cardGrid}>
              {group.tools.map((tool) => (
                <li key={tool.slug}>
                  <ToolCard tool={tool} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className={styles.stepsPreview} aria-labelledby="hub-steps-title">
        <div className={styles.sectionHead}>
          <h2 id="hub-steps-title">{t('hub.stepsTitle')}</h2>
          <p>{t('hub.stepsLead')}</p>
        </div>
        <ol className={styles.stepsList}>
          <li>
            <span className={styles.stepNum}>1</span>
            <div>
              <strong>{t('hub.step1.title')}</strong>
              <p>{t('hub.step1.body')}</p>
            </div>
          </li>
          <li>
            <span className={styles.stepNum}>2</span>
            <div>
              <strong>{t('hub.step2.title')}</strong>
              <p>{t('hub.step2.body')}</p>
            </div>
          </li>
          <li>
            <span className={styles.stepNum}>3</span>
            <div>
              <strong>{t('hub.step3.title')}</strong>
              <p>{t('hub.step3.body')}</p>
            </div>
          </li>
        </ol>
      </section>

      <section className={styles.bottomCta}>
        <h2>{t('hub.bottomTitle')}</h2>
        <p>{t('hub.bottomLead')}</p>
        <Link className={styles.primaryCta} to="/">
          {t('common.openEditor')}
        </Link>
      </section>
    </div>
  )
}

export function ToolPage() {
  const { slug } = useParams()
  const { t } = useLocale()
  const tool = useMemo(() => TOOL_CATALOG.find((item) => item.slug === slug), [slug])
  const [source, setSource] = useState(SAMPLE_LEFT)

  if (!tool) {
    return (
      <article className={styles.page}>
        <h1 className={styles.title}>{t('hub.notFound')}</h1>
        <p className={styles.lead}>
          {t('hub.notFoundLead')} <Link to="/ferramentas">{t('hub.notFoundCatalog')}</Link>.
        </p>
      </article>
    )
  }

  return (
    <article className={styles.page}>
      <header className={styles.toolHero}>
        <p className={styles.kicker}>
          {t(categoryKey(tool.category))} · {t('hub.localFirst')}
        </p>
        <h1 className={styles.title}>{t(toolTitleKey(tool.slug))}</h1>
        <p className={styles.lead}>{t(toolDescriptionKey(tool.slug))}</p>
        <p className={styles.blurb}>{t(toolBlurbKey(tool.slug))}</p>
        <Link className={styles.secondaryCta} to="/">
          {t('hub.openDual')}
        </Link>
      </header>
      <label className={styles.sourceLabel} htmlFor="tool-source">
        {t('common.input')}
      </label>
      <textarea
        id="tool-source"
        className={styles.source}
        value={source}
        onChange={(event) => setSource(event.target.value)}
        spellCheck={false}
      />
      <ToolboxPanel
        sourceText={source}
        lockedTab={tool.tab}
        showSendToRight={false}
        initialTab={tool.tab}
        initialQueryEngine={tool.queryEngine}
        initialLanguage={tool.language}
        initialConvertMode={tool.convertMode}
        initialTransformMode={tool.transformMode}
        initialSqlDialect={tool.sqlDialect}
      />
    </article>
  )
}
