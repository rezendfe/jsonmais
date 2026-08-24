import { JSONPath } from 'jsonpath-plus'
import jmespath from 'jmespath'

export type QueryOk = { ok: true; value: unknown }
export type QueryFail = { ok: false; error: string }
export type QueryResult = QueryOk | QueryFail

export function runJsonPath(document: unknown, expression: string): QueryResult {
  const expr = expression.trim()
  if (!expr) {
    return { ok: false, error: 'Informe uma expressão JSONPath.' }
  }
  try {
    const value = JSONPath({ path: expr, json: document as object, wrap: false })
    return { ok: true, value }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'JSONPath inválido' }
  }
}

export function runJmesPath(document: unknown, expression: string): QueryResult {
  const expr = expression.trim()
  if (!expr) {
    return { ok: false, error: 'Informe uma expressão JMESPath.' }
  }
  try {
    const value = jmespath.search(document, expr)
    return { ok: true, value }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'JMESPath inválido' }
  }
}

export function stringifyQueryResult(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`
}
