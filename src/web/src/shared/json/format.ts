export function formatJson(text: string, indent = 2): string {
  const parsed: unknown = JSON.parse(text)
  return `${JSON.stringify(parsed, null, indent)}\n`
}

export function compactJson(text: string): string {
  const parsed: unknown = JSON.parse(text)
  return JSON.stringify(parsed)
}

export type ParseOk = { ok: true; value: unknown }
export type ParseFail = { ok: false; error: string }
export type ParseResult = ParseOk | ParseFail

export function tryParseJson(text: string): ParseResult {
  try {
    return { ok: true, value: JSON.parse(text) as unknown }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'JSON inválido' }
  }
}

export function parseFailMessage(result: ParseResult, side: string): string | null {
  if (result.ok === false) {
    return `${side} (${result.error})`
  }
  return null
}
