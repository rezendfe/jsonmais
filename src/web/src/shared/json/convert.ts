import { parse as tomlParse, stringify as tomlStringify } from 'smol-toml'
import { XMLBuilder, XMLParser } from 'fast-xml-parser'
import { dump as yamlDump, load as yamlLoad } from 'js-yaml'

export type ConvertOk = { ok: true; text: string }
export type ConvertFail = { ok: false; error: string }
export type ConvertResult = ConvertOk | ConvertFail

export function jsonToYaml(value: unknown): ConvertResult {
  try {
    return { ok: true, text: yamlDump(value, { lineWidth: 100, noRefs: true }) }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Falha ao gerar YAML' }
  }
}

export function yamlToJson(text: string): ConvertResult {
  try {
    const value = yamlLoad(text)
    return { ok: true, text: `${JSON.stringify(value, null, 2)}\n` }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'YAML inválido' }
  }
}

export function jsonToXml(value: unknown, rootName = 'root'): ConvertResult {
  try {
    const builder = new XMLBuilder({
      ignoreAttributes: false,
      format: true,
      indentBy: '  ',
    })
    const payload = typeof value === 'object' && value !== null && !Array.isArray(value) ? value : { item: value }
    return { ok: true, text: builder.build({ [rootName]: payload }) as string }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Falha ao gerar XML' }
  }
}

export function xmlToJson(text: string): ConvertResult {
  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    })
    const value = parser.parse(text)
    return { ok: true, text: `${JSON.stringify(value, null, 2)}\n` }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'XML inválido' }
  }
}

function escapeCsv(cell: string): string {
  if (/[",\n\r]/.test(cell)) {
    return `"${cell.replace(/"/g, '""')}"`
  }
  return cell
}

function cellFromUnknown(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export function jsonToCsv(value: unknown): ConvertResult {
  try {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return { ok: true, text: '' }
      }
      if (!value.every((row) => row !== null && typeof row === 'object' && !Array.isArray(row))) {
        return { ok: false, error: 'CSV exige um array de objetos planos.' }
      }
      const rows = value as Record<string, unknown>[]
      const keys = [...new Set(rows.flatMap((row) => Object.keys(row)))]
      const lines = [
        keys.map(escapeCsv).join(','),
        ...rows.map((row) => keys.map((key) => escapeCsv(cellFromUnknown(row[key]))).join(',')),
      ]
      return { ok: true, text: `${lines.join('\n')}\n` }
    }
    if (value !== null && typeof value === 'object') {
      const record = value as Record<string, unknown>
      const keys = Object.keys(record)
      return {
        ok: true,
        text: `${keys.map(escapeCsv).join(',')}\n${keys.map((key) => escapeCsv(cellFromUnknown(record[key]))).join(',')}\n`,
      }
    }
    return { ok: false, error: 'CSV exige objeto ou array de objetos.' }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Falha ao gerar CSV' }
  }
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"'
        i += 1
      } else if (ch === '"') {
        inQuotes = false
      } else {
        current += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      cells.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  cells.push(current)
  return cells
}

function coerceCell(raw: string): unknown {
  const trimmed = raw.trim()
  if (trimmed === '') return ''
  if (trimmed === 'true') return true
  if (trimmed === 'false') return false
  if (trimmed === 'null') return null
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed)
  try {
    return JSON.parse(trimmed) as unknown
  } catch {
    return raw
  }
}

export function csvToJson(text: string): ConvertResult {
  try {
    const lines = text
      .replace(/^\uFEFF/, '')
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0)
    if (lines.length === 0) {
      return { ok: true, text: '[]\n' }
    }
    const headers = parseCsvLine(lines[0]!)
    const rows = lines.slice(1).map((line) => {
      const cells = parseCsvLine(line)
      const row: Record<string, unknown> = {}
      headers.forEach((header, index) => {
        row[header] = coerceCell(cells[index] ?? '')
      })
      return row
    })
    return { ok: true, text: `${JSON.stringify(rows, null, 2)}\n` }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'CSV inválido' }
  }
}

export function jsonToToml(value: unknown): ConvertResult {
  try {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      return { ok: false, error: 'TOML exige um objeto na raiz.' }
    }
    return { ok: true, text: tomlStringify(value as Record<string, unknown>) }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Falha ao gerar TOML' }
  }
}

export function tomlToJson(text: string): ConvertResult {
  try {
    const value = tomlParse(text)
    return { ok: true, text: `${JSON.stringify(value, null, 2)}\n` }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'TOML inválido' }
  }
}

function escapeMdCell(cell: string): string {
  return cell.replace(/\|/g, '\\|').replace(/\n/g, ' ')
}

export function jsonToMarkdown(value: unknown): ConvertResult {
  try {
    let rows: Record<string, unknown>[]
    if (Array.isArray(value)) {
      if (!value.every((row) => row !== null && typeof row === 'object' && !Array.isArray(row))) {
        return { ok: false, error: 'Markdown table exige array de objetos planos.' }
      }
      rows = value as Record<string, unknown>[]
    } else if (value !== null && typeof value === 'object') {
      rows = [value as Record<string, unknown>]
    } else {
      return { ok: false, error: 'Markdown table exige objeto ou array de objetos.' }
    }
    if (rows.length === 0) return { ok: true, text: '' }
    const keys = [...new Set(rows.flatMap((row) => Object.keys(row)))]
    const header = `| ${keys.map(escapeMdCell).join(' | ')} |`
    const sep = `| ${keys.map(() => '---').join(' | ')} |`
    const body = rows.map((row) => `| ${keys.map((key) => escapeMdCell(cellFromUnknown(row[key]))).join(' | ')} |`)
    return { ok: true, text: `${[header, sep, ...body].join('\n')}\n` }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Falha ao gerar Markdown' }
  }
}
