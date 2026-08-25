import type { MessageKey } from '../../shared/i18n'
import type { CodeLanguage } from '../../shared/json/codegen'
import type { SqlDialect } from '../../shared/json/sql'
import type { ConvertMode, ToolboxTab } from '../toolbox/ToolboxPanel'

export type ToolCategoryId =
  | 'analyze'
  | 'query'
  | 'schema'
  | 'transform'
  | 'security'
  | 'mock'
  | 'sql'
  | 'convert'
  | 'codegen'
  | 'api'

export type ToolDef = {
  slug: string
  tab: ToolboxTab
  category: ToolCategoryId
  queryEngine?: 'jsonpath' | 'jmespath'
  language?: CodeLanguage
  convertMode?: ConvertMode
  transformMode?: 'flatten' | 'unflatten' | 'sort-keys' | 'sort-array' | 'patch-diff' | 'patch-apply' | 'merge'
  sqlDialect?: SqlDialect
}

export const TOOL_CATALOG: ToolDef[] = [
  {
    slug: 'json-formatter',
    tab: 'analyze',
    category: 'analyze',
  },
  {
    slug: 'json-validator',
    tab: 'analyze',
    category: 'analyze',
  },
  {
    slug: 'jsonpath',
    tab: 'query',
    category: 'query',
    queryEngine: 'jsonpath',
  },
  {
    slug: 'jmespath',
    tab: 'query',
    category: 'query',
    queryEngine: 'jmespath',
  },
  {
    slug: 'json-schema',
    tab: 'schema',
    category: 'schema',
  },
  {
    slug: 'json-patch',
    tab: 'transform',
    category: 'transform',
    transformMode: 'patch-diff',
  },
  {
    slug: 'json-merge',
    tab: 'transform',
    category: 'transform',
    transformMode: 'merge',
  },
  {
    slug: 'flatten',
    tab: 'transform',
    category: 'transform',
    transformMode: 'flatten',
  },
  {
    slug: 'security',
    tab: 'security',
    category: 'security',
  },
  {
    slug: 'mask',
    tab: 'security',
    category: 'security',
  },
  {
    slug: 'mock',
    tab: 'mock',
    category: 'mock',
  },
  {
    slug: 'json-to-sql',
    tab: 'sql',
    category: 'sql',
    sqlDialect: 'sqlite',
  },
  {
    slug: 'json-to-yaml',
    tab: 'convert',
    category: 'convert',
    convertMode: 'json-yaml',
  },
  {
    slug: 'json-to-xml',
    tab: 'convert',
    category: 'convert',
    convertMode: 'json-xml',
  },
  {
    slug: 'json-to-csv',
    tab: 'convert',
    category: 'convert',
    convertMode: 'json-csv',
  },
  {
    slug: 'json-to-toml',
    tab: 'convert',
    category: 'convert',
    convertMode: 'json-toml',
  },
  {
    slug: 'json-to-markdown',
    tab: 'convert',
    category: 'convert',
    convertMode: 'json-markdown',
  },
  {
    slug: 'json-to-csharp',
    tab: 'codegen',
    category: 'codegen',
    language: 'csharp',
  },
  {
    slug: 'json-to-typescript',
    tab: 'codegen',
    category: 'codegen',
    language: 'typescript',
  },
  {
    slug: 'json-to-java',
    tab: 'codegen',
    category: 'codegen',
    language: 'java',
  },
  {
    slug: 'json-to-python',
    tab: 'codegen',
    category: 'codegen',
    language: 'python',
  },
  {
    slug: 'json-to-go',
    tab: 'codegen',
    category: 'codegen',
    language: 'go',
  },
  {
    slug: 'json-to-kotlin',
    tab: 'codegen',
    category: 'codegen',
    language: 'kotlin',
  },
  {
    slug: 'http-client',
    tab: 'api',
    category: 'api',
  },
  {
    slug: 'curl-generator',
    tab: 'api',
    category: 'api',
  },
]

export function toolTitleKey(slug: string): MessageKey {
  return `tool.${slug}.title` as MessageKey
}

export function toolDescriptionKey(slug: string): MessageKey {
  return `tool.${slug}.description` as MessageKey
}

export function toolBlurbKey(slug: string): MessageKey {
  return `tool.${slug}.blurb` as MessageKey
}

export function categoryKey(category: ToolCategoryId): MessageKey {
  return `category.${category}` as MessageKey
}
