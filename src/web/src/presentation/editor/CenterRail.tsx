import { useMemo, useState } from 'react'
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
import { generateMock } from '../../shared/json/mock'
import { maskSensitive, scanSensitive } from '../../shared/json/security'
import { jsonToSql, type SqlDialect } from '../../shared/json/sql'
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
  const [mockCount, setMockCount] = useState(3)
  const [sqlDialect, setSqlDialect] = useState<SqlDialect>('sqlite')
  const [apiOpen, setApiOpen] = useState(false)
  const [httpMethod, setHttpMethod] = useState<HttpMethod>('GET')
  const [httpUrl, setHttpUrl] = useState('https://jsonplaceholder.typicode.com/todos/1')
  const [httpHeaders, setHttpHeaders] = useState('Accept: application/json')
  const [httpBody, setHttpBody] = useState('')
  const [popup, setPopup] = useState<ResultPopup | null>(null)

  const convertTargets = CONVERT_TARGETS[convertFrom]
  const parsedLeft = useMemo(() => tryParseJson(leftText), [leftText])

  const notify = (message: string) => onNotify?.(message)

  const onConvertFromChange = (from: ConvertFormat) => {
    setConvertFrom(from)
    const targets = CONVERT_TARGETS[from]
    if (!targets.includes(convertTo)) {
      setConvertTo(targets[0] ?? 'json')
    }
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

  const withParsedLeft = (fn: (value: unknown) => void) => {
    if (parsedLeft.ok === false) {
      notify(parsedLeft.error)
      return
    }
    fn(parsedLeft.value)
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
        allowSend: true,
      })
    })
  }

  const handleMask = () => {
    withParsedLeft((value) => {
      setPopup({
        title: 'Segurança — mascarado',
        text: `${JSON.stringify(maskSensitive(value), null, 2)}\n`,
        allowSend: true,
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
      allowSend: true,
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

      <section className={styles.group} aria-labelledby="rail-api">
        <h2 id="rail-api" className={styles.label}>
          API
        </h2>
        <button type="button" className={styles.actionButton} onClick={() => setApiOpen(true)}>
          Abrir
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
