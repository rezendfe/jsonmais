import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SAMPLE_LEFT } from '../../shared/json/sample'
import { ToolboxPanel } from '../toolbox/ToolboxPanel'
import { TOOL_CATALOG, type ToolCategory, type ToolDef } from './toolCatalog'
import styles from './ToolPages.module.css'

export { TOOL_CATALOG } from './toolCatalog'

const TOOL_COUNT = `${TOOL_CATALOG.length}+`
const CHIPS = [`${TOOL_COUNT} ferramentas`, '100% no browser', 'Sem cadastro', 'Local-first']

const CATEGORY_ORDER: ToolCategory[] = [
  'Analisar',
  'Consultar',
  'Schema',
  'Transformar',
  'Segurança',
  'Mock',
  'SQL',
  'Converter',
  'Gerar código',
  'API',
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

function groupByCategory(tools: ToolDef[]): { category: ToolCategory; tools: ToolDef[] }[] {
  const map = new Map<ToolCategory, ToolDef[]>()
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
  return (
    <Link className={styles.card} to={`/ferramentas/${tool.slug}`}>
      <span className={styles.cardIcon} aria-hidden="true">
        {toolInitials(tool.title)}
      </span>
      <span className={styles.cardBody}>
        <span className={styles.cardCategory}>{tool.category}</span>
        <strong className={styles.cardTitle}>{tool.title}</strong>
        <span className={styles.cardDesc}>{tool.description}</span>
      </span>
    </Link>
  )
}

export function ToolsIndexPage() {
  const groups = useMemo(() => groupByCategory(TOOL_CATALOG), [])

  return (
    <div className={styles.hub}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.brandSignal}>JSON Mais</p>
          <h1 className={styles.heroTitle}>Editor e ferramentas JSON no seu navegador</h1>
          <p className={styles.heroLead}>
            Formate, consulte, converta e gere código sem instalar nada e sem enviar o documento a
            servidores.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryCta} to="/">
              Abrir editor
            </Link>
            <Link className={styles.secondaryCta} to="/como-funciona">
              Como funciona
            </Link>
          </div>
          <ul className={styles.chips}>
            {CHIPS.map((chip) => (
              <li key={chip}>{chip}</li>
            ))}
          </ul>
        </div>
        <EditorMock />
      </section>

      <section className={styles.catalog}>
        <div className={styles.sectionHead}>
          <h2>Ferramentas essenciais em um só lugar</h2>
          <p>Escolha uma ferramenta ou abra o workspace dual-panel completo.</p>
        </div>
        {groups.map((group) => (
          <div key={group.category} className={styles.categoryBlock}>
            <h3 className={styles.categoryTitle}>{group.category}</h3>
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
          <h2 id="hub-steps-title">Como editar JSON online</h2>
          <p>Três passos, do zero ao resultado.</p>
        </div>
        <ol className={styles.stepsList}>
          <li>
            <span className={styles.stepNum}>1</span>
            <div>
              <strong>Cole ou abra o JSON</strong>
              <p>No editor dual-panel — tudo fica no seu navegador.</p>
            </div>
          </li>
          <li>
            <span className={styles.stepNum}>2</span>
            <div>
              <strong>Edite, compare e transforme</strong>
              <p>Texto, árvore, tabela e trilho do meio.</p>
            </div>
          </li>
          <li>
            <span className={styles.stepNum}>3</span>
            <div>
              <strong>Use o toolbox</strong>
              <p>Consultar, converter, schema, mock, SQL e codegen.</p>
            </div>
          </li>
        </ol>
      </section>

      <section className={styles.bottomCta}>
        <h2>Experimente o editor agora</h2>
        <p>Dois painéis, árvore, tabela, compare e toolbox — tudo no browser.</p>
        <Link className={styles.primaryCta} to="/">
          Abrir editor
        </Link>
      </section>
    </div>
  )
}

export function ToolPage() {
  const { slug } = useParams()
  const tool = useMemo(() => TOOL_CATALOG.find((item) => item.slug === slug), [slug])
  const [source, setSource] = useState(SAMPLE_LEFT)

  if (!tool) {
    return (
      <article className={styles.page}>
        <h1 className={styles.title}>Ferramenta não encontrada</h1>
        <p className={styles.lead}>
          Volte ao <Link to="/ferramentas">catálogo</Link>.
        </p>
      </article>
    )
  }

  return (
    <article className={styles.page}>
      <header className={styles.toolHero}>
        <p className={styles.kicker}>{tool.category} · local-first</p>
        <h1 className={styles.title}>{tool.title}</h1>
        <p className={styles.lead}>{tool.description}</p>
        <p className={styles.blurb}>{tool.blurb}</p>
        <Link className={styles.secondaryCta} to="/">
          Abrir no editor dual-panel
        </Link>
      </header>
      <label className={styles.sourceLabel} htmlFor="tool-source">
        Entrada
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
