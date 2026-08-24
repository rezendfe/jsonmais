import { describe, expect, it } from 'vitest'
import { compactJson, formatJson, tryParseJson } from './format'
import { diffPathSegments, formatDiffPreview, formatDiffPath, structuralDiff } from './diff'
import { clearWorkspaceFromLocalStorage, loadWorkspace, saveWorkspace, WORKSPACE_STORAGE_KEY } from './store'
import { computeStats, inspectAtPointer, pointerToJsonPath } from './analyze'
import { runJmesPath, runJsonPath } from './query'
import { csvToJson, jsonToCsv, jsonToMarkdown, jsonToToml, jsonToYaml, tomlToJson, yamlToJson } from './convert'
import { codeLanguageExtension, codeLanguageFilename, generateCode } from './codegen'
import { generateJsonSchema } from './schema'
import { applyJsonPatch, diffToJsonPatch } from './patch'
import { mergeJson } from './merge'
import { flatten, sortKeys, unflatten } from './transform'
import { maskSensitive, scanSensitive } from './security'
import { generateMock } from './mock'
import { jsonToSql } from './sql'
import { generateCurl } from '../http/curl'
import { executeHttpRequest, parseHeadersText } from '../http/request'

describe('formatJson', () => {
  it('pretty-prints ignoring original whitespace', () => {
    expect(formatJson('{"a":1}')).toBe('{\n  "a": 1\n}\n')
  })

  it('compacts', () => {
    expect(compactJson('{\n  "a": 1\n}')).toBe('{"a":1}')
  })

  it('reports parse errors', () => {
    const result = tryParseJson('{')
    expect(result.ok).toBe(false)
  })
})

describe('structuralDiff', () => {
  it('ignores object key order', () => {
    const diff = structuralDiff({ b: 1, a: 2 }, { a: 2, b: 1 })
    expect(diff.added).toBe(0)
    expect(diff.removed).toBe(0)
    expect(diff.changed).toBe(0)
  })

  it('detects added removed changed', () => {
    const diff = structuralDiff({ a: 1, b: 2 }, { a: 9, c: 3 })
    expect(diff.removed).toBe(1)
    expect(diff.added).toBe(1)
    expect(diff.changed).toBe(1)
    expect(diff.entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: '$.b', kind: 'removed', left: 2 }),
        expect.objectContaining({ path: '$.c', kind: 'added', right: 3 }),
        expect.objectContaining({ path: '$.a', kind: 'changed', left: 1, right: 9 }),
      ]),
    )
  })
})

describe('formatDiffPreview', () => {
  it('truncates long values', () => {
    const long = 'x'.repeat(100)
    expect(formatDiffPreview(long).endsWith('…')).toBe(true)
  })
})

describe('formatDiffPath', () => {
  it('formats nested paths', () => {
    expect(formatDiffPath('$.users[0].name')).toBe('users › [0] › name')
    expect(formatDiffPath('$')).toBe('documento (raiz)')
  })

  it('segments path for breadcrumbs', () => {
    expect(diffPathSegments('$.a.b[2]')).toEqual(['a', 'b', '[2]'])
  })
})

describe('store', () => {
  it('roundtrips workspace', () => {
    const raw = saveWorkspace('{"a":1}', '{}')
    const loaded = loadWorkspace(raw)
    expect(loaded).toEqual({ version: 1, left: '{"a":1}', right: '{}' })
  })

  it('rejects garbage', () => {
    expect(loadWorkspace('not-json')).toBeNull()
  })

  it('clears workspace from storage', () => {
    const storage = new Map<string, string>()
    storage.set(WORKSPACE_STORAGE_KEY, saveWorkspace('a', 'b'))
    clearWorkspaceFromLocalStorage({
      removeItem: (key) => {
        storage.delete(key)
      },
    })
    expect(storage.has(WORKSPACE_STORAGE_KEY)).toBe(false)
  })
})

describe('analyze', () => {
  it('counts nodes and depth', () => {
    const text = '{"a":[1,true,null]}'
    const stats = computeStats(text, JSON.parse(text))
    expect(stats.objects).toBe(1)
    expect(stats.arrays).toBe(1)
    expect(stats.numbers).toBe(1)
    expect(stats.booleans).toBe(1)
    expect(stats.nulls).toBe(1)
    expect(stats.maxDepth).toBe(2)
  })

  it('inspects pointer', () => {
    const result = inspectAtPointer({ user: { email: 'a@b.c' } }, '/user/email')
    expect(result.type).toBe('string')
    expect(result.value).toBe('a@b.c')
    expect(result.jsonPath).toBe('$.user.email')
  })

  it('maps pointer to jsonpath', () => {
    expect(pointerToJsonPath('/items/0/name')).toBe('$.items[0].name')
  })
})

describe('query', () => {
  const doc = { users: [{ name: 'Ana', active: true }, { name: 'Bob', active: false }] }

  it('runs jsonpath', () => {
    const result = runJsonPath(doc, '$.users[?(@.active == true)].name')
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.value).toEqual(['Ana'])
  })

  it('runs jmespath', () => {
    const result = runJmesPath(doc, 'users[?active].name')
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.value).toEqual(['Ana'])
  })
})

describe('convert', () => {
  it('roundtrips yaml', () => {
    const yaml = jsonToYaml({ a: 1 })
    expect(yaml.ok).toBe(true)
    if (!yaml.ok) return
    const back = yamlToJson(yaml.text)
    expect(back.ok).toBe(true)
    if (back.ok) expect(JSON.parse(back.text)).toEqual({ a: 1 })
  })

  it('roundtrips csv for array of objects', () => {
    const csv = jsonToCsv([{ id: 1, name: 'x' }])
    expect(csv.ok).toBe(true)
    if (!csv.ok) return
    const back = csvToJson(csv.text)
    expect(back.ok).toBe(true)
    if (back.ok) expect(JSON.parse(back.text)).toEqual([{ id: 1, name: 'x' }])
  })
})

describe('codegen', () => {
  const sample = { id: 1, name: 'Ada', tags: ['dev'] }

  it('emits typescript interface', () => {
    const code = generateCode(sample, 'typescript')
    expect(code).toContain('export interface Root')
    expect(code).toContain('name: string')
  })

  it('emits csharp class', () => {
    const code = generateCode(sample, 'csharp')
    expect(code).toContain('public class Root')
    expect(code).toContain('JsonPropertyName')
  })

  it('emits java and python', () => {
    expect(generateCode(sample, 'java')).toContain('public class Root')
    expect(generateCode(sample, 'python')).toContain('@dataclass')
  })

  it('emits go and kotlin', () => {
    expect(generateCode(sample, 'go')).toContain('type Root struct')
    expect(generateCode(sample, 'kotlin')).toContain('data class Root')
  })

  it('maps language to file extension', () => {
    expect(codeLanguageExtension('typescript')).toBe('.ts')
    expect(codeLanguageExtension('csharp')).toBe('.cs')
    expect(codeLanguageExtension('java')).toBe('.java')
    expect(codeLanguageExtension('python')).toBe('.py')
    expect(codeLanguageExtension('go')).toBe('.go')
    expect(codeLanguageExtension('kotlin')).toBe('.kt')
    expect(codeLanguageFilename('typescript')).toBe('Root.ts')
  })
})

describe('schema', () => {
  it('generates draft 2020-12 object schema', () => {
    const schema = generateJsonSchema({ email: 'a@b.c', age: 1 })
    expect(schema.$schema).toContain('2020-12')
    expect(schema.type).toBe('object')
  })
})

describe('patch', () => {
  it('diffs and applies replace', () => {
    const patch = diffToJsonPatch({ a: 1 }, { a: 2 })
    expect(patch).toEqual([{ op: 'replace', path: '/a', value: 2 }])
    expect(applyJsonPatch({ a: 1 }, patch)).toEqual({ a: 2 })
  })
})

describe('merge', () => {
  it('deep merges objects', () => {
    expect(mergeJson({ a: { b: 1 } }, { a: { c: 2 } }, 'deep')).toEqual({ a: { b: 1, c: 2 } })
  })
})

describe('transform', () => {
  it('flattens and unflattens', () => {
    const flat = flatten({ user: { city: 'Rio' } })
    expect(flat).toEqual({ 'user.city': 'Rio' })
    expect(unflatten(flat)).toEqual({ user: { city: 'Rio' } })
  })

  it('sorts keys', () => {
    expect(sortKeys({ b: 1, a: 2 })).toEqual({ a: 2, b: 1 })
  })
})

describe('security', () => {
  it('scans and masks email', () => {
    const doc = { email: 'felipe@example.com', ok: true }
    const findings = scanSensitive(doc)
    expect(findings.some((f) => f.kind === 'email')).toBe(true)
    const masked = maskSensitive(doc) as { email: string }
    expect(masked.email).toBe('***@example.com')
  })
})

describe('mock', () => {
  it('generates n records from object', () => {
    const result = generateMock({ name: 'Ada', email: 'a@b.c' }, 3)
    expect(Array.isArray(result)).toBe(true)
    expect((result as unknown[]).length).toBe(3)
  })
})

describe('sql', () => {
  it('emits create and insert', () => {
    const sql = jsonToSql([{ id: 1, name: 'x' }], { dialect: 'sqlite', table: 'users' })
    expect(sql).toContain('CREATE TABLE "users"')
    expect(sql).toContain('INSERT INTO "users"')
  })
})

describe('convert extras', () => {
  it('roundtrips toml', () => {
    const toml = jsonToToml({ a: 1, b: 'x' })
    expect(toml.ok).toBe(true)
    if (!toml.ok) return
    const back = tomlToJson(toml.text)
    expect(back.ok).toBe(true)
    if (back.ok) expect(JSON.parse(back.text)).toEqual({ a: 1, b: 'x' })
  })

  it('builds markdown table', () => {
    const md = jsonToMarkdown([{ id: 1, name: 'x' }])
    expect(md.ok).toBe(true)
    if (md.ok) expect(md.text).toContain('| id | name |')
  })
})

describe('http', () => {
  it('parses header lines', () => {
    expect(parseHeadersText('Accept: application/json\nX-Test: 1')).toEqual({
      Accept: 'application/json',
      'X-Test': '1',
    })
  })

  it('generates curl command', () => {
    const curl = generateCurl({
      method: 'POST',
      url: 'https://api.test/x',
      headers: { 'Content-Type': 'application/json' },
      body: '{"a":1}',
    })
    expect(curl).toContain("curl -X POST")
    expect(curl).toContain('https://api.test/x')
    expect(curl).toContain('Content-Type: application/json')
  })

  it('executes fetch mock', async () => {
    const mockFetch = async () =>
      new Response('{"ok":true}', {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' },
      })
    const result = await executeHttpRequest(
      { method: 'GET', url: 'https://example.com', headers: {} },
      mockFetch as typeof fetch,
    )
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.status).toBe(200)
      expect(result.bodyText).toContain('ok')
    }
  })
})
