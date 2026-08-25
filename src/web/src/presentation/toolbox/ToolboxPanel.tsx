import { useEffect, useMemo, useState } from 'react'
import { computeStats, inspectAtPointer, type InspectResult, type JsonStats } from '../../shared/json/analyze'
import { codeLanguageFilename, generateCode, type CodeLanguage } from '../../shared/json/codegen'
import {
  csvToJson,
  jsonToCsv,
  jsonToMarkdown,
  jsonToToml,
  jsonToXml,
  jsonToYaml,
  tomlToJson,
  xmlToJson,
  yamlToJson,
  type ConvertResult,
} from '../../shared/json/convert'
import { formatJson, tryParseJson } from '../../shared/json/format'
import { mergeJson, type MergeMode } from '../../shared/json/merge'
import { generateMock } from '../../shared/json/mock'
import { applyJsonPatch, diffToJsonPatch, parsePatch, stringifyPatch } from '../../shared/json/patch'
import { runJmesPath, runJsonPath, stringifyQueryResult } from '../../shared/json/query'
import { stringifySchema } from '../../shared/json/schema'
import { maskSensitive, scanSensitive, type SensitiveFinding } from '../../shared/json/security'
import { jsonToSql, type SqlDialect } from '../../shared/json/sql'
import { flatten, sortArray, sortKeys, unflatten, type SortDir } from '../../shared/json/transform'
import { generateCurl } from '../../shared/http/curl'
import {
  executeHttpRequest,
  formatHttpResponse,
  parseHeadersText,
  type HttpMethod,
} from '../../shared/http/request'
import { ResultModal } from './ResultModal'
import styles from './ToolboxPanel.module.css'

export type ConvertMode =
  | 'json-yaml'
  | 'yaml-json'
  | 'json-xml'
  | 'xml-json'
  | 'json-csv'
  | 'csv-json'
  | 'json-toml'
  | 'toml-json'
  | 'json-markdown'

type ConvertFormat = 'json' | 'yaml' | 'xml' | 'csv' | 'toml' | 'markdown'

type ResultPopup = {
  title: string
  text: string
  downloadFilename?: string
  allowSend?: boolean
}

const CONVERT_LABEL: Record<ConvertFormat, string> = {
  json: 'JSON',
  yaml: 'YAML',
  xml: 'XML',
  csv: 'CSV',
  toml: 'TOML',
  markdown: 'Markdown',
}

const CONVERT_TARGETS: Record<ConvertFormat, ConvertFormat[]> = {
  json: ['yaml', 'xml', 'csv', 'toml', 'markdown'],
  yaml: ['json'],
  xml: ['json'],
  csv: ['json'],
  toml: ['json'],
  markdown: [],
}

const TRANSFORM_HINT: Record<
  'flatten' | 'unflatten' | 'sort-keys' | 'sort-array' | 'patch-diff' | 'patch-apply' | 'merge',
  string
> = {
  flatten: 'Achata objetos aninhados em chaves com ponto (ex.: user.name). Fonte = esquerda.',
  unflatten: 'Reconstrói objetos aninhados a partir de chaves planas. Fonte = esquerda.',
  'sort-keys': 'Ordena as chaves de objetos (recursivo). Fonte = esquerda.',
  'sort-array': 'Ordena um array (opcionalmente por uma chave). Fonte = esquerda.',
  'patch-diff': 'Gera JSON Patch RFC 6902: esquerda = base, direita = alvo.',
  'patch-apply': 'Aplica um JSON Patch na esquerda (cole o patch abaixo ou use a direita).',
  merge: 'Combina esquerda (base) + direita (alvo) no modo escolhido.',
}

function modeToFormats(mode: ConvertMode): { from: ConvertFormat; to: ConvertFormat } {
  const [from, to] = mode.split('-') as [ConvertFormat, ConvertFormat]
  return { from, to }
}

function formatsToMode(from: ConvertFormat, to: ConvertFormat): ConvertMode | null {
  const key = `${from}-${to}` as ConvertMode
  const allowed: ConvertMode[] = [
    'json-yaml',
    'yaml-json',
    'json-xml',
    'xml-json',
    'json-csv',
    'csv-json',
    'json-toml',
    'toml-json',
    'json-markdown',
  ]
  return allowed.includes(key) ? key : null
}

export type ToolboxTab =
  | 'analyze'
  | 'query'
  | 'convert'
  | 'codegen'
  | 'transform'
  | 'schema'
  | 'security'
  | 'mock'
  | 'sql'
  | 'api'

export type ToolboxPanelProps = {
  sourceText: string
  rightText?: string
  initialTab?: ToolboxTab
  lockedTab?: ToolboxTab
  initialQueryEngine?: 'jsonpath' | 'jmespath'
  initialLanguage?: CodeLanguage
  initialConvertMode?: ConvertMode
  initialTransformMode?: 'flatten' | 'unflatten' | 'sort-keys' | 'sort-array' | 'patch-diff' | 'patch-apply' | 'merge'
  initialSqlDialect?: SqlDialect
  showSendToRight?: boolean
  onSendToRight?: (text: string) => void
  onClose?: () => void
}

type Feedback = { kind: 'ok' | 'error'; text: string } | null

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function ResultActions({
  text,
  showSendToRight,
  downloadFilename,
  onCopy,
  onSend,
  onDownload,
}: {
  text: string
  showSendToRight?: boolean
  downloadFilename?: string
  onCopy: (text: string) => void
  onSend?: (text: string) => void
  onDownload?: (text: string, filename: string) => void
}) {
  return (
    <div className={styles.actions}>
      <button type="button" className={styles.button} onClick={() => void onCopy(text)}>
        Copiar
      </button>
      {onDownload && downloadFilename ? (
        <button type="button" className={styles.buttonPrimary} onClick={() => onDownload(text, downloadFilename)}>
          Baixar
        </button>
      ) : showSendToRight ? (
        <button type="button" className={styles.buttonPrimary} onClick={() => onSend?.(text)}>
          Enviar à direita
        </button>
      ) : null}
    </div>
  )
}

export function ToolboxPanel({
  sourceText,
  rightText = '',
  initialTab,
  lockedTab,
  initialQueryEngine = 'jsonpath',
  initialLanguage = 'typescript',
  initialConvertMode = 'json-yaml',
  initialTransformMode = 'flatten',
  initialSqlDialect = 'sqlite',
  showSendToRight = true,
  onSendToRight,
}: ToolboxPanelProps) {
  const [expandedTab, setExpandedTab] = useState<ToolboxTab | null>(lockedTab ?? initialTab ?? null)
  const [pointer, setPointer] = useState('/')
  const [inspect, setInspect] = useState<InspectResult | null>(null)
  const [queryEngine, setQueryEngine] = useState<'jsonpath' | 'jmespath'>(initialQueryEngine)
  const [queryExpr, setQueryExpr] = useState('$.')
  const [queryOut, setQueryOut] = useState('')
  const initialFormats = modeToFormats(initialConvertMode)
  const [convertFrom, setConvertFrom] = useState<ConvertFormat>(initialFormats.from)
  const [convertTo, setConvertTo] = useState<ConvertFormat>(initialFormats.to)
  const [convertOut, setConvertOut] = useState('')
  const [language, setLanguage] = useState<CodeLanguage>(initialLanguage)
  const [codeOut, setCodeOut] = useState('')
  const [transformMode, setTransformMode] = useState(initialTransformMode)
  const [transformOut, setTransformOut] = useState('')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [sortKey, setSortKey] = useState('')
  const [mergeMode, setMergeMode] = useState<MergeMode>('deep')
  const [patchInput, setPatchInput] = useState('')
  const [schemaOut, setSchemaOut] = useState('')
  const [findings, setFindings] = useState<SensitiveFinding[]>([])
  const [mockCount, setMockCount] = useState(3)
  const [sqlDialect, setSqlDialect] = useState<SqlDialect>(initialSqlDialect)
  const [sqlTable, setSqlTable] = useState('items')
  const [httpMethod, setHttpMethod] = useState<HttpMethod>('GET')
  const [httpUrl, setHttpUrl] = useState('https://jsonplaceholder.typicode.com/todos/1')
  const [httpHeaders, setHttpHeaders] = useState('Accept: application/json')
  const [httpBody, setHttpBody] = useState('')
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [popup, setPopup] = useState<ResultPopup | null>(null)

  const convertMode = formatsToMode(convertFrom, convertTo)
  const convertTargets = CONVERT_TARGETS[convertFrom]

  const parsed = useMemo(() => tryParseJson(sourceText), [sourceText])
  const parsedRight = useMemo(() => tryParseJson(rightText), [rightText])
  const stats: JsonStats | null = useMemo(() => {
    if (parsed.ok === false) return null
    return computeStats(sourceText, parsed.value)
  }, [parsed, sourceText])

  useEffect(() => {
    if (lockedTab) setExpandedTab(lockedTab)
  }, [lockedTab])

  const flash = (kind: 'ok' | 'error', text: string) => {
    setFeedback({ kind, text })
  }

  const withParsed = (fn: (value: unknown) => void) => {
    if (parsed.ok === false) {
      flash('error', parsed.error)
      return
    }
    fn(parsed.value)
  }

  const onInspect = () => {
    withParsed((value) => {
      try {
        setInspect(inspectAtPointer(value, pointer))
        flash('ok', 'Inspeção atualizada.')
      } catch (err) {
        setInspect(null)
        flash('error', err instanceof Error ? err.message : 'Falha na inspeção')
      }
    })
  }

  const onQuery = () => {
    withParsed((value) => {
      const result = queryEngine === 'jsonpath' ? runJsonPath(value, queryExpr) : runJmesPath(value, queryExpr)
      if (result.ok === false) {
        setQueryOut('')
        flash('error', result.error)
        return
      }
      setQueryOut(stringifyQueryResult(result.value))
      flash('ok', 'Consulta executada.')
    })
  }

  const openPopup = (next: ResultPopup) => setPopup(next)

  const runConvert = () => {
    if (!convertMode) {
      flash('error', 'Escolha um par De → Para suportado.')
      return
    }
    let result: ConvertResult
    switch (convertMode) {
      case 'json-yaml':
        if (parsed.ok === false) {
          flash('error', parsed.error)
          return
        }
        result = jsonToYaml(parsed.value)
        break
      case 'yaml-json':
        result = yamlToJson(sourceText)
        break
      case 'json-xml':
        if (parsed.ok === false) {
          flash('error', parsed.error)
          return
        }
        result = jsonToXml(parsed.value)
        break
      case 'xml-json':
        result = xmlToJson(sourceText)
        break
      case 'json-csv':
        if (parsed.ok === false) {
          flash('error', parsed.error)
          return
        }
        result = jsonToCsv(parsed.value)
        break
      case 'csv-json':
        result = csvToJson(sourceText)
        break
      case 'json-toml':
        if (parsed.ok === false) {
          flash('error', parsed.error)
          return
        }
        result = jsonToToml(parsed.value)
        break
      case 'toml-json':
        result = tomlToJson(sourceText)
        break
      case 'json-markdown':
        if (parsed.ok === false) {
          flash('error', parsed.error)
          return
        }
        result = jsonToMarkdown(parsed.value)
        break
    }
    if (result.ok === false) {
      setConvertOut('')
      flash('error', result.error)
      return
    }
    setConvertOut(result.text)
    flash('ok', 'Conversão concluída.')
  }

  const onCodegen = () => {
    withParsed((value) => {
      const code = generateCode(value, language)
      setCodeOut(code)
      if (showSendToRight) {
        onSendToRight?.(code)
        flash('ok', 'Código gerado e enviado ao painel direito.')
      } else {
        flash('ok', 'Código gerado.')
      }
    })
  }

  const onConvertFromChange = (from: ConvertFormat) => {
    setConvertFrom(from)
    const targets = CONVERT_TARGETS[from]
    if (!targets.includes(convertTo)) {
      setConvertTo(targets[0] ?? 'json')
    }
  }

  const runTransform = () => {
    try {
      switch (transformMode) {
        case 'flatten':
          withParsed((value) => {
            setTransformOut(`${JSON.stringify(flatten(value), null, 2)}\n`)
            flash('ok', 'Flatten concluído.')
          })
          return
        case 'unflatten':
          withParsed((value) => {
            if (value === null || typeof value !== 'object' || Array.isArray(value)) {
              flash('error', 'Unflatten exige um objeto plano.')
              return
            }
            setTransformOut(`${JSON.stringify(unflatten(value as Record<string, unknown>), null, 2)}\n`)
            flash('ok', 'Unflatten concluído.')
          })
          return
        case 'sort-keys':
          withParsed((value) => {
            setTransformOut(`${JSON.stringify(sortKeys(value, sortDir), null, 2)}\n`)
            flash('ok', 'Chaves ordenadas.')
          })
          return
        case 'sort-array':
          withParsed((value) => {
            setTransformOut(`${JSON.stringify(sortArray(value, sortKey || undefined, sortDir), null, 2)}\n`)
            flash('ok', 'Array ordenado.')
          })
          return
        case 'patch-diff': {
          if (parsed.ok === false) {
            flash('error', parsed.error)
            return
          }
          if (parsedRight.ok === false) {
            flash('error', `Direita: ${parsedRight.error}`)
            return
          }
          const ops = diffToJsonPatch(parsed.value, parsedRight.value)
          const text = stringifyPatch(ops)
          setTransformOut(text)
          setPatchInput(text)
          flash('ok', 'JSON Patch gerado (L→R).')
          return
        }
        case 'patch-apply': {
          if (parsed.ok === false) {
            flash('error', parsed.error)
            return
          }
          const ops = parsePatch(patchInput || rightText)
          const next = applyJsonPatch(parsed.value, ops)
          setTransformOut(`${JSON.stringify(next, null, 2)}\n`)
          flash('ok', 'Patch aplicado na esquerda.')
          return
        }
        case 'merge': {
          if (parsed.ok === false) {
            flash('error', parsed.error)
            return
          }
          if (parsedRight.ok === false) {
            flash('error', `Direita: ${parsedRight.error}`)
            return
          }
          const merged = mergeJson(parsed.value, parsedRight.value, mergeMode)
          setTransformOut(`${JSON.stringify(merged, null, 2)}\n`)
          flash('ok', 'Merge concluído.')
          return
        }
      }
    } catch (err) {
      setTransformOut('')
      flash('error', err instanceof Error ? err.message : 'Falha na transformação')
    }
  }

  const onSchema = () => {
    withParsed((value) => {
      setSchemaOut(stringifySchema(value))
      flash('ok', 'Schema gerado.')
    })
  }

  const onScan = () => {
    withParsed((value) => {
      const list = scanSensitive(value)
      setFindings(list)
      const text = list.length ? `${JSON.stringify(list, null, 2)}\n` : 'Nenhum dado sensível detectado.\n'
      openPopup({
        title: list.length ? `Segurança — ${list.length} alerta(s)` : 'Segurança — nada suspeito',
        text,
      })
      flash('ok', list.length ? `${list.length} alerta(s).` : 'Nada suspeito.')
    })
  }

  const onMask = () => {
    withParsed((value) => {
      const masked = maskSensitive(value)
      const text = `${JSON.stringify(masked, null, 2)}\n`
      openPopup({ title: 'Segurança — dados mascarados', text })
      flash('ok', 'Dados mascarados.')
    })
  }

  const onMock = () => {
    withParsed((value) => {
      const mocked = generateMock(value, mockCount)
      const text = `${JSON.stringify(mocked, null, 2)}\n`
      openPopup({ title: `Mock — ${mockCount} registro(s)`, text, allowSend: true })
      flash('ok', 'Mock gerado.')
    })
  }

  const onSql = () => {
    withParsed((value) => {
      try {
        const text = jsonToSql(value, { dialect: sqlDialect, table: sqlTable })
        openPopup({
          title: `SQL — ${sqlDialect}`,
          text,
          allowSend: true,
          downloadFilename: `${sqlTable || 'items'}.sql`,
        })
        flash('ok', 'SQL gerado.')
      } catch (err) {
        flash('error', err instanceof Error ? err.message : 'Falha ao gerar SQL')
      }
    })
  }

  const buildHttpRequest = () => ({
    method: httpMethod,
    url: httpUrl,
    headers: parseHeadersText(httpHeaders),
    body: httpBody || undefined,
  })

  const onHttpSend = async () => {
    const result = await executeHttpRequest(buildHttpRequest())
    if (result.ok === false) {
      flash('error', result.error)
      return
    }
    openPopup({
      title: `API — resposta ${result.status}`,
      text: formatHttpResponse(result),
      allowSend: true,
    })
    flash('ok', `Resposta ${result.status}.`)
  }

  const onCurlGenerate = () => {
    openPopup({
      title: 'API — cURL',
      text: generateCurl(buildHttpRequest()),
      downloadFilename: 'request.curl.sh',
    })
    flash('ok', 'cURL gerado.')
  }

  const useLeftAsBody = () => {
    setHttpBody(sourceText)
    flash('ok', 'Corpo preenchido com o painel esquerdo.')
  }

  const handleCopy = async (text: string) => {
    if (!text) {
      flash('error', 'Nada para copiar.')
      return
    }
    const ok = await copyText(text)
    flash(ok ? 'ok' : 'error', ok ? '✓ Copiado para a área de transferência' : 'Falha ao copiar')
  }

  const handleSend = (text: string) => {
    if (!text) {
      flash('error', 'Nada para enviar.')
      return
    }
    onSendToRight?.(text)
    flash('ok', 'Enviado ao painel direito.')
  }

  const handleDownload = (text: string, filename: string) => {
    if (!text) {
      flash('error', 'Nada para baixar.')
      return
    }
    downloadText(filename, text)
    flash('ok', `Arquivo ${filename} baixado.`)
  }

  const tabs: Array<[ToolboxTab, string]> = [
    ['analyze', 'Analisar'],
    ['query', 'Consultar'],
    ['transform', 'Patch / Flatten'],
    ['schema', 'Schema'],
    ['convert', 'Converter'],
    ['codegen', 'Gerar'],
    ['security', 'Segurança'],
    ['mock', 'Mock'],
    ['sql', 'SQL'],
    ['api', 'API'],
  ]
  /** Já no trilho entre painéis — só reaparecem em rotas SEO (`lockedTab`). */
  const railHostedTabs = new Set<ToolboxTab>([
    'query',
    'convert',
    'codegen',
    'transform',
    'schema',
    'security',
    'mock',
    'sql',
    'api',
  ])
  const visibleTabs = lockedTab
    ? tabs.filter(([id]) => id === lockedTab)
    : tabs.filter(([id]) => !railHostedTabs.has(id))
  const analyzeTab = visibleTabs.find(([id]) => id === 'analyze')
  const accordionTabs = visibleTabs.filter(([id]) => id !== 'analyze')

  const toggleTab = (id: ToolboxTab) => {
    if (lockedTab) return
    setExpandedTab((current) => (current === id ? null : id))
  }

  const isExpanded = (id: ToolboxTab) => (lockedTab ? lockedTab === id : expandedTab === id)

  const renderTabContent = (id: ToolboxTab) => {
    if (id === 'analyze') {
      return (
        <div className={styles.body}>
          {stats ? (
            <dl className={styles.stats}>
              <div>
                <dt>Objetos</dt>
                <dd>{stats.objects}</dd>
              </div>
              <div>
                <dt>Arrays</dt>
                <dd>{stats.arrays}</dd>
              </div>
              <div>
                <dt>Strings</dt>
                <dd>{stats.strings}</dd>
              </div>
              <div>
                <dt>Números</dt>
                <dd>{stats.numbers}</dd>
              </div>
              <div>
                <dt>Booleanos</dt>
                <dd>{stats.booleans}</dd>
              </div>
              <div>
                <dt>Nulls</dt>
                <dd>{stats.nulls}</dd>
              </div>
              <div>
                <dt>Profundidade</dt>
                <dd>{stats.maxDepth}</dd>
              </div>
              <div>
                <dt>Tamanho</dt>
                <dd>{(stats.sizeBytes / 1024).toFixed(1)} KB</dd>
              </div>
              <div>
                <dt>Maior array</dt>
                <dd>{stats.largestArrayLength}</dd>
              </div>
            </dl>
          ) : (
            <p className={styles.hint}>JSON inválido na fonte — estatísticas indisponíveis.</p>
          )}
          <div className={styles.row}>
            <label className={styles.label} htmlFor="inspect-pointer">
              JSON Pointer
            </label>
            <input
              id="inspect-pointer"
              className={styles.input}
              value={pointer}
              onChange={(e) => setPointer(e.target.value)}
              placeholder="/user/email"
            />
            <button type="button" className={styles.button} onClick={onInspect}>
              Inspecionar
            </button>
          </div>
          {inspect ? (
            <pre className={styles.output}>
              {`Tipo: ${inspect.type}
JSONPath: ${inspect.jsonPath}
Pointer: ${inspect.path}
Valor:
${typeof inspect.value === 'string' ? inspect.value : formatJson(JSON.stringify(inspect.value))}`}
            </pre>
          ) : null}
          {inspect ? (
            <div className={styles.actions}>
              <button type="button" className={styles.button} onClick={() => void handleCopy(inspect.jsonPath)}>
                Copiar JSONPath
              </button>
              <button type="button" className={styles.button} onClick={() => void handleCopy(inspect.path)}>
                Copiar Pointer
              </button>
              <button
                type="button"
                className={styles.button}
                onClick={() =>
                  void handleCopy(typeof inspect.value === 'string' ? inspect.value : JSON.stringify(inspect.value, null, 2))
                }
              >
                Copiar valor
              </button>
            </div>
          ) : null}
        </div>
      )
    }

    if (id === 'query') {
      return (
        <div className={styles.body}>
          <div className={styles.row}>
            <label className={styles.label} htmlFor="query-engine">
              Motor
            </label>
            <select
              id="query-engine"
              className={styles.input}
              value={queryEngine}
              onChange={(e) => setQueryEngine(e.target.value as 'jsonpath' | 'jmespath')}
            >
              <option value="jsonpath">JSONPath</option>
              <option value="jmespath">JMESPath</option>
            </select>
            <input
              className={styles.inputGrow}
              value={queryExpr}
              onChange={(e) => setQueryExpr(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  onQuery()
                }
              }}
              aria-label="Expressão de consulta"
              placeholder={queryEngine === 'jsonpath' ? '$.users[*].email' : 'users[*].email'}
            />
            <button type="button" className={styles.button} onClick={onQuery}>
              Executar
            </button>
          </div>
          <textarea className={styles.textarea} value={queryOut} readOnly aria-label="Resultado da consulta" />
          <ResultActions text={queryOut} showSendToRight={showSendToRight} onCopy={handleCopy} onSend={handleSend} />
        </div>
      )
    }

    if (id === 'transform') {
      return (
        <div className={styles.body}>
          <p className={styles.hint}>{TRANSFORM_HINT[transformMode]}</p>
          <div className={styles.convertPair}>
            <div className={styles.convertField}>
              <label className={styles.label} htmlFor="transform-mode">
                Operação
              </label>
              <select
                id="transform-mode"
                className={styles.input}
                value={transformMode}
                onChange={(e) => setTransformMode(e.target.value as typeof transformMode)}
              >
                <option value="flatten">Flatten (achatar)</option>
                <option value="unflatten">Unflatten (aninhar)</option>
                <option value="sort-keys">Ordenar chaves</option>
                <option value="sort-array">Ordenar array</option>
                <option value="patch-diff">Gerar JSON Patch (L→R)</option>
                <option value="patch-apply">Aplicar JSON Patch</option>
                <option value="merge">Merge (L+R)</option>
              </select>
            </div>
          </div>
          <div className={styles.stackActions}>
            <button type="button" className={styles.buttonPrimary} onClick={runTransform}>
              Transformar
            </button>
          </div>
          {transformMode === 'sort-keys' || transformMode === 'sort-array' ? (
            <div className={styles.row}>
              <label className={styles.label} htmlFor="sort-dir">
                Direção
              </label>
              <select id="sort-dir" className={styles.input} value={sortDir} onChange={(e) => setSortDir(e.target.value as SortDir)}>
                <option value="asc">Asc</option>
                <option value="desc">Desc</option>
              </select>
              {transformMode === 'sort-array' ? (
                <input
                  className={styles.inputGrow}
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value)}
                  placeholder="chave (opcional)"
                  aria-label="Chave de ordenação"
                />
              ) : null}
            </div>
          ) : null}
          {transformMode === 'merge' ? (
            <div className={styles.row}>
              <label className={styles.label} htmlFor="merge-mode">
                Modo
              </label>
              <select id="merge-mode" className={styles.input} value={mergeMode} onChange={(e) => setMergeMode(e.target.value as MergeMode)}>
                <option value="deep">Deep</option>
                <option value="shallow">Shallow</option>
                <option value="overwrite">Overwrite</option>
              </select>
            </div>
          ) : null}
          {transformMode === 'patch-apply' ? (
            <textarea
              className={styles.textarea}
              value={patchInput}
              onChange={(e) => setPatchInput(e.target.value)}
              aria-label="JSON Patch"
              placeholder="Cole o JSON Patch aqui (ou use o painel direito)"
            />
          ) : null}
          <textarea className={styles.textarea} value={transformOut} readOnly aria-label="Resultado da transformação" />
          <ResultActions text={transformOut} showSendToRight={showSendToRight} onCopy={handleCopy} onSend={handleSend} />
        </div>
      )
    }

    if (id === 'schema') {
      return (
        <div className={styles.body}>
          <div className={styles.row}>
            <button type="button" className={styles.button} onClick={onSchema}>
              Gerar JSON Schema
            </button>
          </div>
          <textarea className={styles.textarea} value={schemaOut} readOnly aria-label="JSON Schema" />
          <ResultActions text={schemaOut} showSendToRight={showSendToRight} onCopy={handleCopy} onSend={handleSend} />
        </div>
      )
    }

    if (id === 'convert') {
      return (
        <div className={styles.body}>
          <div className={styles.convertPair}>
            <div className={styles.convertField}>
              <label className={styles.label} htmlFor="convert-from">
                De
              </label>
              <select
                id="convert-from"
                className={styles.input}
                value={convertFrom}
                onChange={(e) => onConvertFromChange(e.target.value as ConvertFormat)}
              >
                {(Object.keys(CONVERT_LABEL) as ConvertFormat[])
                  .filter((format) => CONVERT_TARGETS[format].length > 0)
                  .map((format) => (
                    <option key={format} value={format}>
                      {CONVERT_LABEL[format]}
                    </option>
                  ))}
              </select>
            </div>
            <span className={styles.convertArrow} aria-hidden="true">
              →
            </span>
            <div className={styles.convertField}>
              <label className={styles.label} htmlFor="convert-to">
                Para
              </label>
              <select
                id="convert-to"
                className={styles.input}
                value={convertTo}
                onChange={(e) => setConvertTo(e.target.value as ConvertFormat)}
              >
                {convertTargets.map((format) => (
                  <option key={format} value={format}>
                    {CONVERT_LABEL[format]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles.stackActions}>
            <button type="button" className={styles.buttonPrimary} onClick={runConvert} disabled={!convertMode}>
              Converter
            </button>
          </div>
          <textarea className={styles.textarea} value={convertOut} readOnly aria-label="Resultado da conversão" />
          <ResultActions text={convertOut} showSendToRight={showSendToRight} onCopy={handleCopy} onSend={handleSend} />
        </div>
      )
    }

    if (id === 'codegen') {
      return (
        <div className={styles.body}>
          <div className={styles.convertPair}>
            <div className={styles.convertField}>
              <label className={styles.label} htmlFor="codegen-lang">
                Linguagem
              </label>
              <select
                id="codegen-lang"
                className={styles.input}
                value={language}
                onChange={(e) => setLanguage(e.target.value as CodeLanguage)}
              >
                <option value="typescript">TypeScript</option>
                <option value="csharp">C#</option>
                <option value="java">Java</option>
                <option value="python">Python</option>
                <option value="go">Go</option>
                <option value="kotlin">Kotlin</option>
              </select>
            </div>
          </div>
          <div className={styles.stackActions}>
            <button type="button" className={styles.buttonPrimary} onClick={onCodegen}>
              Gerar
            </button>
          </div>
          <p className={styles.hint}>O código é enviado ao painel direito. Você também pode baixar o arquivo.</p>
          <textarea className={styles.textarea} value={codeOut} readOnly aria-label="Código gerado" />
          <ResultActions
            text={codeOut}
            downloadFilename={codeLanguageFilename(language)}
            onCopy={handleCopy}
            onDownload={handleDownload}
          />
        </div>
      )
    }

    if (id === 'security') {
      return (
        <div className={styles.body}>
          <p className={styles.hint}>Varre o JSON da esquerda em busca de dados sensíveis e mostra o resultado em um pop-up.</p>
          <div className={styles.stackActions}>
            <button type="button" className={styles.buttonPrimary} onClick={onScan}>
              Verificar
            </button>
            <button type="button" className={styles.button} onClick={onMask}>
              Mascarar
            </button>
          </div>
          {findings.length > 0 ? (
            <p className={styles.hint}>Última verificação: {findings.length} possível(is) dado(s) sensível(is).</p>
          ) : null}
        </div>
      )
    }

    if (id === 'mock') {
      return (
        <div className={styles.body}>
          <p className={styles.hint}>Gera dados fictícios com a mesma forma do JSON da esquerda. O resultado abre em um pop-up.</p>
          <div className={styles.row}>
            <label className={styles.label} htmlFor="mock-count">
              Registros
            </label>
            <input
              id="mock-count"
              className={styles.input}
              type="number"
              min={1}
              max={1000}
              value={mockCount}
              onChange={(e) => setMockCount(Number(e.target.value) || 1)}
            />
          </div>
          <div className={styles.stackActions}>
            <button type="button" className={styles.buttonPrimary} onClick={onMock}>
              Gerar mock
            </button>
          </div>
        </div>
      )
    }

    if (id === 'sql') {
      return (
        <div className={styles.body}>
          <p className={styles.hint}>Gera CREATE/INSERT a partir do JSON da esquerda. O SQL abre em um pop-up.</p>
          <div className={styles.row}>
            <label className={styles.label} htmlFor="sql-dialect">
              Dialeto
            </label>
            <select
              id="sql-dialect"
              className={styles.input}
              value={sqlDialect}
              onChange={(e) => setSqlDialect(e.target.value as SqlDialect)}
            >
              <option value="sqlite">SQLite</option>
              <option value="postgres">PostgreSQL</option>
              <option value="mysql">MySQL</option>
              <option value="sqlserver">SQL Server</option>
            </select>
            <input
              className={styles.inputGrow}
              value={sqlTable}
              onChange={(e) => setSqlTable(e.target.value)}
              aria-label="Nome da tabela"
              placeholder="tabela"
            />
          </div>
          <div className={styles.stackActions}>
            <button type="button" className={styles.buttonPrimary} onClick={onSql}>
              Gerar SQL
            </button>
          </div>
        </div>
      )
    }

    if (id === 'api') {
      return (
        <div className={styles.body}>
          <p className={styles.hint}>Requisição no browser — APIs sem CORS podem falhar. Resposta e cURL abrem em pop-up.</p>
          <div className={styles.row}>
            <label className={styles.label} htmlFor="http-method">
              Método
            </label>
            <select
              id="http-method"
              className={styles.input}
              value={httpMethod}
              onChange={(e) => setHttpMethod(e.target.value as HttpMethod)}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
              <option value="HEAD">HEAD</option>
            </select>
            <input
              className={styles.inputGrow}
              value={httpUrl}
              onChange={(e) => setHttpUrl(e.target.value)}
              aria-label="URL"
              placeholder="https://api.exemplo.com/recurso"
            />
          </div>
          <label className={styles.label} htmlFor="http-headers">
            Headers (um por linha)
          </label>
          <textarea
            id="http-headers"
            className={styles.textarea}
            value={httpHeaders}
            onChange={(e) => setHttpHeaders(e.target.value)}
            aria-label="Headers HTTP"
          />
          <div className={styles.row}>
            <label className={styles.label} htmlFor="http-body">
              Body
            </label>
            <button type="button" className={styles.button} onClick={useLeftAsBody}>
              Usar esquerda
            </button>
          </div>
          <textarea
            id="http-body"
            className={styles.textarea}
            value={httpBody}
            onChange={(e) => setHttpBody(e.target.value)}
            aria-label="Corpo HTTP"
          />
          <div className={styles.stackActions}>
            <button type="button" className={styles.buttonPrimary} onClick={() => void onHttpSend()}>
              Enviar
            </button>
            <button type="button" className={styles.button} onClick={onCurlGenerate}>
              Gerar cURL
            </button>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <section className={styles.panel} aria-label="Ferramentas JSON">
      {feedback ? (
        <p className={feedback.kind === 'ok' ? styles.ok : styles.error} role="status">
          {feedback.text}
        </p>
      ) : null}

      {analyzeTab ? (
        <div className={styles.fixedSection}>
          <h2 className={styles.fixedTitle}>{analyzeTab[1]}</h2>
          <div className={styles.fixedBody}>{renderTabContent('analyze')}</div>
        </div>
      ) : null}

      {accordionTabs.length > 0 ? (
        <div className={styles.accordion}>
          {accordionTabs.map(([id, label]) => (
            <div key={id} className={styles.accordionItem}>
              <button
                type="button"
                className={`${styles.accordionTrigger} ${isExpanded(id) ? styles.accordionTriggerOpen : ''}`}
                aria-expanded={isExpanded(id)}
                disabled={Boolean(lockedTab)}
                onClick={() => toggleTab(id)}
              >
                <span>{label}</span>
                {!lockedTab ? (
                  <span className={styles.accordionIcon} aria-hidden="true">
                    {isExpanded(id) ? '−' : '+'}
                  </span>
                ) : null}
              </button>
              {isExpanded(id) ? <div className={styles.accordionPanel}>{renderTabContent(id)}</div> : null}
            </div>
          ))}
        </div>
      ) : null}

      <ResultModal
        open={Boolean(popup)}
        title={popup?.title ?? ''}
        text={popup?.text ?? ''}
        showSendToRight={showSendToRight && Boolean(popup?.allowSend)}
        downloadFilename={popup?.downloadFilename}
        onCopy={handleCopy}
        onSend={handleSend}
        onDownload={handleDownload}
        onClose={() => setPopup(null)}
      />
    </section>
  )
}
