import { useMemo, useState } from 'react'
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
import { tryParseJson } from '../../shared/json/format'
import { mergeJson, type MergeMode } from '../../shared/json/merge'
import { generateMock } from '../../shared/json/mock'
import { applyJsonPatch, diffToJsonPatch, parsePatch, stringifyPatch } from '../../shared/json/patch'
import { runJmesPath, runJsonPath, stringifyQueryResult } from '../../shared/json/query'
import { stringifySchema } from '../../shared/json/schema'
import { maskSensitive, scanSensitive } from '../../shared/json/security'
import { jsonToSql, type SqlDialect } from '../../shared/json/sql'
import { flatten, sortArray, sortKeys, unflatten, type SortDir } from '../../shared/json/transform'
import { generateCurl } from '../../shared/http/curl'
import {
  executeHttpRequest,
  formatHttpResponse,
  parseHeadersText,
  type HttpMethod,
} from '../../shared/http/request'
import { ResultModal } from '../toolbox/ResultModal'
import styles from './CenterRail.module.css'

type ConvertFormat = 'json' | 'yaml' | 'xml' | 'csv' | 'toml' | 'markdown'
type PatchMode = 'flatten' | 'unflatten' | 'sort-keys' | 'sort-array' | 'patch-diff' | 'patch-apply' | 'merge'

type ResultPopup = {
  title: string
  text: string
  downloadFilename?: string
  allowSend?: boolean
}

type CenterRailProps = {
  leftText: string
  rightText: string
  compareActive: boolean
  onCopyLeft: () => void
  onCopyRight: () => void
  onTransformLeft: () => void
  onTransformRight: () => void
  onCompare: () => void
  onSendToRight: (text: string) => void
  onNotify?: (message: string) => void
}

const CONVERT_LABEL: Record<ConvertFormat, string> = {
  json: 'JSON',
  yaml: 'YAML',
  xml: 'XML',
  csv: 'CSV',
  toml: 'TOML',
  markdown: 'MD',
}

const CONVERT_TARGETS: Record<ConvertFormat, ConvertFormat[]> = {
  json: ['yaml', 'xml', 'csv', 'toml', 'markdown'],
  yaml: ['json'],
  xml: ['json'],
  csv: ['json'],
  toml: ['json'],
  markdown: [],
}

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

function runConvert(from: ConvertFormat, to: ConvertFormat, sourceText: string): ConvertResult {
  const parsed = tryParseJson(sourceText)
  const mode = `${from}-${to}`
  switch (mode) {
    case 'json-yaml':
      if (parsed.ok === false) return { ok: false, error: parsed.error }
      return jsonToYaml(parsed.value)
    case 'yaml-json':
      return yamlToJson(sourceText)
    case 'json-xml':
      if (parsed.ok === false) return { ok: false, error: parsed.error }
      return jsonToXml(parsed.value)
    case 'json-csv':
      if (parsed.ok === false) return { ok: false, error: parsed.error }
      return jsonToCsv(parsed.value)
    case 'csv-json':
      return csvToJson(sourceText)
    case 'xml-json':
      return xmlToJson(sourceText)
    case 'json-toml':
      if (parsed.ok === false) return { ok: false, error: parsed.error }
      return jsonToToml(parsed.value)
    case 'toml-json':
      return tomlToJson(sourceText)
    case 'json-markdown':
      if (parsed.ok === false) return { ok: false, error: parsed.error }
      return jsonToMarkdown(parsed.value)
    default:
      return { ok: false, error: 'Conversão não suportada.' }
  }
}

export function CenterRail({
  leftText,
  rightText,
  compareActive,
  onCopyLeft,
  onCopyRight,
  onTransformLeft,
  onTransformRight,
  onCompare,
  onSendToRight,
  onNotify,
}: CenterRailProps) {
  const [convertFrom, setConvertFrom] = useState<ConvertFormat>('json')
  const [convertTo, setConvertTo] = useState<ConvertFormat>('yaml')
  const [language, setLanguage] = useState<CodeLanguage>('typescript')
  const [codeOut, setCodeOut] = useState('')
  const [patchMode, setPatchMode] = useState<PatchMode>('flatten')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [sortKey, setSortKey] = useState('')
  const [mergeMode, setMergeMode] = useState<MergeMode>('deep')
  const [mockCount, setMockCount] = useState(3)
  const [sqlDialect, setSqlDialect] = useState<SqlDialect>('sqlite')
  const [queryOpen, setQueryOpen] = useState(false)
  const [queryEngine, setQueryEngine] = useState<'jsonpath' | 'jmespath'>('jsonpath')
  const [queryExpr, setQueryExpr] = useState('$.')
  const [apiOpen, setApiOpen] = useState(false)
  const [httpMethod, setHttpMethod] = useState<HttpMethod>('GET')
  const [httpUrl, setHttpUrl] = useState('https://jsonplaceholder.typicode.com/todos/1')
  const [httpHeaders, setHttpHeaders] = useState('Accept: application/json')
  const [httpBody, setHttpBody] = useState('')
  const [popup, setPopup] = useState<ResultPopup | null>(null)

  const convertTargets = CONVERT_TARGETS[convertFrom]
  const parsedLeft = useMemo(() => tryParseJson(leftText), [leftText])
  const parsedRight = useMemo(() => tryParseJson(rightText), [rightText])

  const notify = (message: string) => onNotify?.(message)

  const onConvertFromChange = (from: ConvertFormat) => {
    setConvertFrom(from)
    const targets = CONVERT_TARGETS[from]
    if (!targets.includes(convertTo)) {
      setConvertTo(targets[0] ?? 'json')
    }
  }

  const withParsedLeft = (fn: (value: unknown) => void) => {
    if (parsedLeft.ok === false) {
      notify(parsedLeft.error)
      return
    }
    fn(parsedLeft.value)
  }

  const handleConvert = () => {
    const result = runConvert(convertFrom, convertTo, leftText)
    if (result.ok === false) {
      notify(result.error)
      return
    }
    onSendToRight(result.text)
    notify(`Convertido ${CONVERT_LABEL[convertFrom]} → ${CONVERT_LABEL[convertTo]} (direita).`)
  }

  const handleQuery = () => {
    withParsedLeft((value) => {
      const result = queryEngine === 'jsonpath' ? runJsonPath(value, queryExpr) : runJmesPath(value, queryExpr)
      if (result.ok === false) {
        notify(result.error)
        return
      }
      setQueryOpen(false)
      setPopup({
        title: `Consultar — ${queryEngine === 'jsonpath' ? 'JSONPath' : 'JMESPath'}`,
        text: stringifyQueryResult(result.value),
        allowSend: true,
      })
    })
  }

  const handlePatch = () => {
    try {
      switch (patchMode) {
        case 'flatten':
          withParsedLeft((value) => {
            onSendToRight(`${JSON.stringify(flatten(value), null, 2)}\n`)
            notify('Flatten enviado à direita.')
          })
          return
        case 'unflatten':
          withParsedLeft((value) => {
            if (value === null || typeof value !== 'object' || Array.isArray(value)) {
              notify('Unflatten exige um objeto plano.')
              return
            }
            onSendToRight(`${JSON.stringify(unflatten(value as Record<string, unknown>), null, 2)}\n`)
            notify('Unflatten enviado à direita.')
          })
          return
        case 'sort-keys':
          withParsedLeft((value) => {
            onSendToRight(`${JSON.stringify(sortKeys(value, sortDir), null, 2)}\n`)
            notify('Chaves ordenadas (direita).')
          })
          return
        case 'sort-array':
          withParsedLeft((value) => {
            onSendToRight(`${JSON.stringify(sortArray(value, sortKey || undefined, sortDir), null, 2)}\n`)
            notify('Array ordenado (direita).')
          })
          return
        case 'patch-diff': {
          if (parsedLeft.ok === false) {
            notify(parsedLeft.error)
            return
          }
          if (parsedRight.ok === false) {
            notify(`Direita: ${parsedRight.error}`)
            return
          }
          onSendToRight(stringifyPatch(diffToJsonPatch(parsedLeft.value, parsedRight.value)))
          notify('JSON Patch gerado (direita).')
          return
        }
        case 'patch-apply': {
          if (parsedLeft.ok === false) {
            notify(parsedLeft.error)
            return
          }
          const ops = parsePatch(rightText)
          onSendToRight(`${JSON.stringify(applyJsonPatch(parsedLeft.value, ops), null, 2)}\n`)
          notify('Patch aplicado (direita).')
          return
        }
        case 'merge': {
          if (parsedLeft.ok === false) {
            notify(parsedLeft.error)
            return
          }
          if (parsedRight.ok === false) {
            notify(`Direita: ${parsedRight.error}`)
            return
          }
          onSendToRight(`${JSON.stringify(mergeJson(parsedLeft.value, parsedRight.value, mergeMode), null, 2)}\n`)
          notify('Merge enviado à direita.')
        }
      }
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Falha na operação')
    }
  }

  const handleSchema = () => {
    withParsedLeft((value) => {
      onSendToRight(stringifySchema(value))
      notify('JSON Schema enviado à direita.')
    })
  }

  const handleCodegen = () => {
    withParsedLeft((value) => {
      const code = generateCode(value, language)
      setCodeOut(code)
      onSendToRight(code)
      notify('Código gerado e enviado à direita.')
    })
  }

  const handleSecurity = () => {
    withParsedLeft((value) => {
      const findings = scanSensitive(value)
      const text = findings.length
        ? `${JSON.stringify(findings, null, 2)}\n`
        : 'Nenhum dado sensível detectado.\n'
      setPopup({
        title: findings.length ? `Segurança — ${findings.length} alerta(s)` : 'Segurança — nada suspeito',
        text,
      })
    })
  }

  const handleMask = () => {
    withParsedLeft((value) => {
      setPopup({
        title: 'Segurança — mascarado',
        text: `${JSON.stringify(maskSensitive(value), null, 2)}\n`,
      })
    })
  }

  const handleMock = () => {
    withParsedLeft((value) => {
      setPopup({
        title: `Mock — ${mockCount} registro(s)`,
        text: `${JSON.stringify(generateMock(value, mockCount), null, 2)}\n`,
        allowSend: true,
      })
    })
  }

  const handleSql = () => {
    withParsedLeft((value) => {
      try {
        setPopup({
          title: `SQL — ${sqlDialect}`,
          text: jsonToSql(value, { dialect: sqlDialect, table: 'items' }),
          allowSend: true,
          downloadFilename: 'items.sql',
        })
      } catch (err) {
        notify(err instanceof Error ? err.message : 'Falha ao gerar SQL')
      }
    })
  }

  const handleApiSend = async () => {
    const result = await executeHttpRequest({
      method: httpMethod,
      url: httpUrl,
      headers: parseHeadersText(httpHeaders),
      body: httpBody || undefined,
    })
    if (result.ok === false) {
      notify(result.error)
      return
    }
    setApiOpen(false)
    setPopup({
      title: `API — resposta ${result.status}`,
      text: formatHttpResponse(result),
      allowSend: true,
    })
  }

  const handleCurl = () => {
    setApiOpen(false)
    setPopup({
      title: 'API — cURL',
      text: generateCurl({
        method: httpMethod,
        url: httpUrl,
        headers: parseHeadersText(httpHeaders),
        body: httpBody || undefined,
      }),
      downloadFilename: 'request.curl.sh',
    })
  }

  const handleCopy = async (text: string) => {
    const ok = await copyText(text)
    notify(ok ? '✓ Copiado' : 'Falha ao copiar')
  }

  const handleSend = (text: string) => {
    onSendToRight(text)
    notify('Enviado ao painel direito.')
    setPopup(null)
  }

  const handleDownload = (text: string, filename: string) => {
    downloadText(filename, text)
    notify(`Arquivo ${filename} baixado.`)
  }

  return (
    <div className={styles.rail} role="toolbar" aria-label="Operações entre painéis">
      {/* Copiar sempre primeiro; demais em ordem alfabética */}
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

      <section className={styles.group} aria-labelledby="rail-api">
        <h2 id="rail-api" className={styles.label}>
          API
        </h2>
        <button type="button" className={styles.actionButton} onClick={() => setApiOpen(true)}>
          Abrir
        </button>
      </section>

      <section className={styles.group} aria-labelledby="rail-query">
        <h2 id="rail-query" className={styles.label}>
          Consultar
        </h2>
        <button type="button" className={styles.actionButton} onClick={() => setQueryOpen(true)}>
          Abrir
        </button>
      </section>

      <section className={styles.group} aria-labelledby="rail-convert">
        <h2 id="rail-convert" className={styles.label}>
          Converter
        </h2>
        <div className={styles.convertPair}>
          <label className={styles.srOnly} htmlFor="rail-convert-from">
            De
          </label>
          <select
            id="rail-convert-from"
            className={styles.select}
            value={convertFrom}
            onChange={(e) => onConvertFromChange(e.target.value as ConvertFormat)}
            title="De"
          >
            {(Object.keys(CONVERT_LABEL) as ConvertFormat[])
              .filter((format) => CONVERT_TARGETS[format].length > 0)
              .map((format) => (
                <option key={format} value={format}>
                  {CONVERT_LABEL[format]}
                </option>
              ))}
          </select>
          <span className={styles.arrow} aria-hidden="true">
            →
          </span>
          <label className={styles.srOnly} htmlFor="rail-convert-to">
            Para
          </label>
          <select
            id="rail-convert-to"
            className={styles.select}
            value={convertTo}
            onChange={(e) => setConvertTo(e.target.value as ConvertFormat)}
            title="Para"
          >
            {convertTargets.map((format) => (
              <option key={format} value={format}>
                {CONVERT_LABEL[format]}
              </option>
            ))}
          </select>
        </div>
        <button type="button" className={styles.actionButton} onClick={handleConvert}>
          Converter
        </button>
      </section>

      <section className={styles.group} aria-labelledby="rail-diff">
        <h2 id="rail-diff" className={styles.label}>
          Diferenças
        </h2>
        <button
          type="button"
          className={`${styles.actionButton} ${compareActive ? styles.compareActive : ''}`}
          aria-pressed={compareActive}
          title="Comparar estrutura dos dois documentos"
          onClick={onCompare}
        >
          <CompareIcon />
          Comparar
        </button>
      </section>

      <section className={styles.group} aria-labelledby="rail-codegen">
        <h2 id="rail-codegen" className={styles.label}>
          Gerar
        </h2>
        <select
          className={styles.select}
          value={language}
          onChange={(e) => setLanguage(e.target.value as CodeLanguage)}
          aria-label="Linguagem"
        >
          <option value="typescript">TypeScript</option>
          <option value="csharp">C#</option>
          <option value="java">Java</option>
          <option value="python">Python</option>
          <option value="go">Go</option>
          <option value="kotlin">Kotlin</option>
        </select>
        <button type="button" className={styles.actionButton} onClick={handleCodegen}>
          Gerar
        </button>
        <button
          type="button"
          className={styles.actionButtonGhost}
          disabled={!codeOut}
          onClick={() => handleDownload(codeOut, codeLanguageFilename(language))}
        >
          Baixar
        </button>
      </section>

      <section className={styles.group} aria-labelledby="rail-schema">
        <h2 id="rail-schema" className={styles.label}>
          Gerar schema
        </h2>
        <button type="button" className={styles.actionButton} onClick={handleSchema}>
          Gerar
        </button>
      </section>

      <section className={styles.group} aria-labelledby="rail-mock">
        <h2 id="rail-mock" className={styles.label}>
          Mock
        </h2>
        <input
          className={styles.select}
          type="number"
          min={1}
          max={1000}
          value={mockCount}
          onChange={(e) => setMockCount(Number(e.target.value) || 1)}
          aria-label="Quantidade de registros"
          title="Registros"
        />
        <button type="button" className={styles.actionButton} onClick={handleMock}>
          Gerar
        </button>
      </section>

      <section className={styles.group} aria-labelledby="rail-patch">
        <h2 id="rail-patch" className={styles.label}>
          Patch / Flatten
        </h2>
        <select
          className={styles.select}
          value={patchMode}
          onChange={(e) => setPatchMode(e.target.value as PatchMode)}
          aria-label="Operação"
        >
          <option value="flatten">Flatten</option>
          <option value="unflatten">Unflatten</option>
          <option value="sort-keys">Ordenar chaves</option>
          <option value="sort-array">Ordenar array</option>
          <option value="patch-diff">Patch L→R</option>
          <option value="patch-apply">Aplicar patch</option>
          <option value="merge">Merge</option>
        </select>
        {patchMode === 'sort-keys' || patchMode === 'sort-array' ? (
          <select
            className={styles.select}
            value={sortDir}
            onChange={(e) => setSortDir(e.target.value as SortDir)}
            aria-label="Direção"
          >
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>
        ) : null}
        {patchMode === 'sort-array' ? (
          <input
            className={styles.select}
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            placeholder="chave"
            aria-label="Chave de ordenação"
          />
        ) : null}
        {patchMode === 'merge' ? (
          <select
            className={styles.select}
            value={mergeMode}
            onChange={(e) => setMergeMode(e.target.value as MergeMode)}
            aria-label="Modo merge"
          >
            <option value="deep">Deep</option>
            <option value="shallow">Shallow</option>
            <option value="overwrite">Overwrite</option>
          </select>
        ) : null}
        <button type="button" className={styles.actionButton} onClick={handlePatch}>
          Executar
        </button>
      </section>

      <section className={styles.group} aria-labelledby="rail-security">
        <h2 id="rail-security" className={styles.label}>
          Segurança
        </h2>
        <button type="button" className={styles.actionButton} onClick={handleSecurity}>
          Verificar
        </button>
        <button type="button" className={styles.actionButtonGhost} onClick={handleMask}>
          Mascarar
        </button>
      </section>

      <section className={styles.group} aria-labelledby="rail-sql">
        <h2 id="rail-sql" className={styles.label}>
          SQL
        </h2>
        <select
          className={styles.select}
          value={sqlDialect}
          onChange={(e) => setSqlDialect(e.target.value as SqlDialect)}
          aria-label="Dialeto SQL"
        >
          <option value="sqlite">SQLite</option>
          <option value="postgres">Postgres</option>
          <option value="mysql">MySQL</option>
          <option value="sqlserver">SQL Server</option>
        </select>
        <button type="button" className={styles.actionButton} onClick={handleSql}>
          Gerar
        </button>
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

      <ResultModal
        open={Boolean(popup)}
        title={popup?.title ?? ''}
        text={popup?.text ?? ''}
        showSendToRight={Boolean(popup?.allowSend)}
        downloadFilename={popup?.downloadFilename}
        onCopy={handleCopy}
        onSend={handleSend}
        onDownload={handleDownload}
        onClose={() => setPopup(null)}
      />

      {queryOpen ? (
        <div className={styles.backdrop} role="presentation" onClick={() => setQueryOpen(false)}>
          <div
            className={styles.apiDialog}
            role="dialog"
            aria-modal="true"
            aria-label="Consultar JSON"
            onClick={(event) => event.stopPropagation()}
          >
            <header className={styles.apiHeader}>
              <h2 className={styles.apiTitle}>Consultar</h2>
              <button type="button" className={styles.apiClose} onClick={() => setQueryOpen(false)} aria-label="Fechar">
                ×
              </button>
            </header>
            <div className={styles.apiBody}>
              <div className={styles.apiRow}>
                <select
                  className={styles.apiSelect}
                  value={queryEngine}
                  onChange={(e) => setQueryEngine(e.target.value as 'jsonpath' | 'jmespath')}
                  aria-label="Motor"
                >
                  <option value="jsonpath">JSONPath</option>
                  <option value="jmespath">JMESPath</option>
                </select>
                <input
                  className={styles.apiInput}
                  value={queryExpr}
                  onChange={(e) => setQueryExpr(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleQuery()
                    }
                  }}
                  aria-label="Expressão"
                  placeholder={queryEngine === 'jsonpath' ? '$.users[*].email' : 'users[*].email'}
                />
              </div>
            </div>
            <footer className={styles.apiFooter}>
              <button type="button" className={styles.actionButton} onClick={handleQuery}>
                Executar
              </button>
            </footer>
          </div>
        </div>
      ) : null}

      {apiOpen ? (
        <div className={styles.backdrop} role="presentation" onClick={() => setApiOpen(false)}>
          <div
            className={styles.apiDialog}
            role="dialog"
            aria-modal="true"
            aria-label="Cliente API"
            onClick={(event) => event.stopPropagation()}
          >
            <header className={styles.apiHeader}>
              <h2 className={styles.apiTitle}>API</h2>
              <button type="button" className={styles.apiClose} onClick={() => setApiOpen(false)} aria-label="Fechar">
                ×
              </button>
            </header>
            <div className={styles.apiBody}>
              <div className={styles.apiRow}>
                <select
                  className={styles.apiSelect}
                  value={httpMethod}
                  onChange={(e) => setHttpMethod(e.target.value as HttpMethod)}
                  aria-label="Método HTTP"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                  <option value="DELETE">DELETE</option>
                  <option value="HEAD">HEAD</option>
                </select>
                <input
                  className={styles.apiInput}
                  value={httpUrl}
                  onChange={(e) => setHttpUrl(e.target.value)}
                  aria-label="URL"
                  placeholder="https://api.exemplo.com/recurso"
                />
              </div>
              <label className={styles.apiLabel} htmlFor="rail-api-headers">
                Headers
              </label>
              <textarea
                id="rail-api-headers"
                className={styles.apiTextarea}
                value={httpHeaders}
                onChange={(e) => setHttpHeaders(e.target.value)}
              />
              <div className={styles.apiRow}>
                <label className={styles.apiLabel} htmlFor="rail-api-body">
                  Body
                </label>
                <button type="button" className={styles.actionButtonGhost} onClick={() => setHttpBody(leftText)}>
                  Usar esquerda
                </button>
              </div>
              <textarea
                id="rail-api-body"
                className={styles.apiTextarea}
                value={httpBody}
                onChange={(e) => setHttpBody(e.target.value)}
              />
            </div>
            <footer className={styles.apiFooter}>
              <button type="button" className={styles.actionButton} onClick={() => void handleApiSend()}>
                Enviar
              </button>
              <button type="button" className={styles.actionButtonGhost} onClick={handleCurl}>
                Gerar cURL
              </button>
            </footer>
          </div>
        </div>
      ) : null}
    </div>
  )
}
