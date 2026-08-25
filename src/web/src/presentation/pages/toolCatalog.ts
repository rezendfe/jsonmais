import type { CodeLanguage } from '../../shared/json/codegen'
import type { SqlDialect } from '../../shared/json/sql'
import type { ConvertMode, ToolboxTab } from '../toolbox/ToolboxPanel'

export type ToolCategory =
  | 'Analisar'
  | 'Consultar'
  | 'Schema'
  | 'Transformar'
  | 'Segurança'
  | 'Mock'
  | 'SQL'
  | 'Converter'
  | 'Gerar código'
  | 'API'

export type ToolDef = {
  slug: string
  title: string
  description: string
  tab: ToolboxTab
  blurb: string
  category: ToolCategory
  queryEngine?: 'jsonpath' | 'jmespath'
  language?: CodeLanguage
  convertMode?: ConvertMode
  transformMode?: 'flatten' | 'unflatten' | 'sort-keys' | 'sort-array' | 'patch-diff' | 'patch-apply' | 'merge'
  sqlDialect?: SqlDialect
}

export const TOOL_CATALOG: ToolDef[] = [
  {
    slug: 'json-formatter',
    title: 'Formatador JSON',
    description: 'Formate e compacte JSON no navegador, sem enviar dados ao servidor.',
    tab: 'analyze',
    category: 'Analisar',
    blurb: 'Cole o JSON no editor principal (Ctrl+Shift+F formata, Ctrl+Shift+M compacta) ou use as estatísticas abaixo.',
  },
  {
    slug: 'json-validator',
    title: 'Validador JSON',
    description: 'Valide sintaxe JSON localmente e inspecione caminhos.',
    tab: 'analyze',
    category: 'Analisar',
    blurb: 'Erros de parse aparecem ao analisar. Use o inspector por JSON Pointer.',
  },
  {
    slug: 'jsonpath',
    title: 'JSONPath',
    description: 'Playground JSONPath 100% no browser.',
    tab: 'query',
    category: 'Consultar',
    queryEngine: 'jsonpath',
    blurb: 'Escolha o motor JSONPath, execute e copie o resultado.',
  },
  {
    slug: 'jmespath',
    title: 'JMESPath',
    description: 'Consulte JSON com JMESPath sem sair do JSON Mais.',
    tab: 'query',
    category: 'Consultar',
    queryEngine: 'jmespath',
    blurb: 'Selecione JMESPath no painel de consulta.',
  },
  {
    slug: 'json-schema',
    title: 'JSON Schema Generator',
    description: 'Gere JSON Schema Draft 2020-12 a partir de um sample.',
    tab: 'schema',
    category: 'Schema',
    blurb: 'Clique em Gerar JSON Schema e copie ou use no workspace.',
  },
  {
    slug: 'json-patch',
    title: 'JSON Patch',
    description: 'Gere ou aplique JSON Patch RFC 6902 localmente.',
    tab: 'transform',
    category: 'Transformar',
    transformMode: 'patch-diff',
    blurb: 'No workspace dual-panel: esquerda = base, direita = alvo. Aqui use a aba Transformar.',
  },
  {
    slug: 'json-merge',
    title: 'JSON Merge',
    description: 'Combine dois JSONs (shallow, deep ou overwrite).',
    tab: 'transform',
    category: 'Transformar',
    transformMode: 'merge',
    blurb: 'No editor dual-panel, merge usa esquerda + direita.',
  },
  {
    slug: 'flatten',
    title: 'Flatten / Unflatten',
    description: 'Achate ou restaure estruturas JSON aninhadas.',
    tab: 'transform',
    category: 'Transformar',
    transformMode: 'flatten',
    blurb: 'Use Flatten ou Unflatten na aba Transformar.',
  },
  {
    slug: 'security',
    title: 'Security Scanner',
    description: 'Detecte possíveis dados sensíveis no JSON.',
    tab: 'security',
    category: 'Segurança',
    blurb: 'No trilho entre os painéis: Verificar lista caminhos suspeitos; Mascarar ofusca valores.',
  },
  {
    slug: 'mask',
    title: 'Data Masking',
    description: 'Mascarar e-mails, tokens e outros padrões sensíveis.',
    tab: 'security',
    category: 'Segurança',
    blurb: 'No editor, use Mascarar no trilho central (Segurança).',
  },
  {
    slug: 'mock',
    title: 'Mock Data Generator',
    description: 'Gere dados fictícios a partir da estrutura do sample.',
    tab: 'mock',
    category: 'Mock',
    blurb: 'No trilho entre os painéis: informe a quantidade e clique em Gerar.',
  },
  {
    slug: 'json-to-sql',
    title: 'JSON para SQL',
    description: 'Gere CREATE TABLE e INSERT a partir de JSON.',
    tab: 'sql',
    category: 'SQL',
    sqlDialect: 'sqlite',
    blurb: 'Escolha o dialeto no trilho entre os painéis e clique em Gerar.',
  },
  {
    slug: 'json-to-yaml',
    title: 'JSON para YAML',
    description: 'Converta JSON ↔ YAML localmente.',
    tab: 'convert',
    category: 'Converter',
    convertMode: 'json-yaml',
    blurb: 'No trilho central: De → Para (JSON/YAML) e Converter.',
  },
  {
    slug: 'json-to-xml',
    title: 'JSON para XML',
    description: 'Converta JSON ↔ XML no navegador.',
    tab: 'convert',
    category: 'Converter',
    convertMode: 'json-xml',
    blurb: 'No trilho central: De → Para (JSON/XML) e Converter.',
  },
  {
    slug: 'json-to-csv',
    title: 'JSON para CSV',
    description: 'Converta arrays de objetos para CSV e de volta.',
    tab: 'convert',
    category: 'Converter',
    convertMode: 'json-csv',
    blurb: 'No trilho central: De → Para (JSON/CSV). CSV exige array de objetos planos.',
  },
  {
    slug: 'json-to-toml',
    title: 'JSON para TOML',
    description: 'Converta JSON ↔ TOML no navegador.',
    tab: 'convert',
    category: 'Converter',
    convertMode: 'json-toml',
    blurb: 'No trilho central: De → Para (JSON/TOML). TOML exige objeto na raiz.',
  },
  {
    slug: 'json-to-markdown',
    title: 'JSON para Markdown',
    description: 'Converta objetos/arrays em tabela Markdown.',
    tab: 'convert',
    category: 'Converter',
    convertMode: 'json-markdown',
    blurb: 'No trilho central: De → Para (JSON/Markdown).',
  },
  {
    slug: 'json-to-csharp',
    title: 'JSON para C#',
    description: 'Gere classes C# a partir de um sample JSON.',
    tab: 'codegen',
    category: 'Gerar código',
    language: 'csharp',
    blurb: 'Selecione C# e clique em Gerar.',
  },
  {
    slug: 'json-to-typescript',
    title: 'JSON para TypeScript',
    description: 'Gere interfaces TypeScript a partir de JSON.',
    tab: 'codegen',
    category: 'Gerar código',
    language: 'typescript',
    blurb: 'Selecione TypeScript e clique em Gerar.',
  },
  {
    slug: 'json-to-java',
    title: 'JSON para Java',
    description: 'Gere classes Java a partir de JSON.',
    tab: 'codegen',
    category: 'Gerar código',
    language: 'java',
    blurb: 'Selecione Java e clique em Gerar.',
  },
  {
    slug: 'json-to-python',
    title: 'JSON para Python',
    description: 'Gere dataclasses Python a partir de JSON.',
    tab: 'codegen',
    category: 'Gerar código',
    language: 'python',
    blurb: 'Selecione Python e clique em Gerar.',
  },
  {
    slug: 'json-to-go',
    title: 'JSON para Go',
    description: 'Gere structs Go a partir de JSON.',
    tab: 'codegen',
    category: 'Gerar código',
    language: 'go',
    blurb: 'Selecione Go e clique em Gerar.',
  },
  {
    slug: 'json-to-kotlin',
    title: 'JSON para Kotlin',
    description: 'Gere data classes Kotlin a partir de JSON.',
    tab: 'codegen',
    category: 'Gerar código',
    language: 'kotlin',
    blurb: 'Selecione Kotlin e clique em Gerar.',
  },
  {
    slug: 'http-client',
    title: 'HTTP Client',
    description: 'Envie requisições HTTP no browser e carregue a resposta.',
    tab: 'api',
    category: 'API',
    blurb: 'No trilho central: Abrir API, enviar a requisição e ver a resposta no pop-up.',
  },
  {
    slug: 'curl-generator',
    title: 'cURL Generator',
    description: 'Gere comando cURL a partir de uma requisição HTTP.',
    tab: 'api',
    category: 'API',
    blurb: 'No trilho central: Abrir API e Gerar cURL.',
  },
]
