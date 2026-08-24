export type SqlDialect = 'sqlite' | 'postgres' | 'mysql' | 'sqlserver'

export type SqlOptions = {
  dialect: SqlDialect
  table: string
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function quoteIdent(name: string, dialect: SqlDialect): string {
  const cleaned = name.replace(/[^A-Za-z0-9_]/g, '_') || 'col'
  switch (dialect) {
    case 'mysql':
      return `\`${cleaned}\``
    case 'sqlserver':
      return `[${cleaned}]`
    default:
      return `"${cleaned}"`
  }
}

function sqlType(value: unknown, dialect: SqlDialect): string {
  if (typeof value === 'boolean') {
    if (dialect === 'sqlite') return 'INTEGER'
    if (dialect === 'sqlserver') return 'BIT'
    return 'BOOLEAN'
  }
  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'INTEGER' : dialect === 'sqlserver' ? 'FLOAT' : 'REAL'
  }
  if (value === null) return dialect === 'sqlserver' ? 'NVARCHAR(MAX)' : 'TEXT'
  if (typeof value === 'object') return dialect === 'sqlserver' ? 'NVARCHAR(MAX)' : 'TEXT'
  return dialect === 'sqlserver' ? 'NVARCHAR(255)' : 'TEXT'
}

function sqlLiteral(value: unknown, dialect: SqlDialect): string {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'boolean') {
    if (dialect === 'sqlite' || dialect === 'sqlserver') return value ? '1' : '0'
    return value ? 'TRUE' : 'FALSE'
  }
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL'
  if (typeof value === 'object') {
    const json = JSON.stringify(value).replace(/'/g, "''")
    return `'${json}'`
  }
  return `'${String(value).replace(/'/g, "''")}'`
}

function rowsFromValue(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    if (!value.every((row) => isObject(row))) {
      throw new Error('SQL exige array de objetos planos.')
    }
    return value as Record<string, unknown>[]
  }
  if (isObject(value)) return [value]
  throw new Error('SQL exige objeto ou array de objetos.')
}

export function jsonToSql(value: unknown, options: SqlOptions): string {
  const rows = rowsFromValue(value)
  if (rows.length === 0) {
    return `-- tabela vazia\n`
  }
  const table = quoteIdent(options.table || 'items', options.dialect)
  const keys = [...new Set(rows.flatMap((row) => Object.keys(row)))]
  const createCols = keys.map((key) => {
    const sample = rows.find((row) => row[key] !== undefined && row[key] !== null)?.[key]
    return `  ${quoteIdent(key, options.dialect)} ${sqlType(sample, options.dialect)}`
  })
  const create = `CREATE TABLE ${table} (\n${createCols.join(',\n')}\n);`
  const inserts = rows.map((row) => {
    const cols = keys.map((key) => quoteIdent(key, options.dialect)).join(', ')
    const vals = keys.map((key) => sqlLiteral(row[key] ?? null, options.dialect)).join(', ')
    return `INSERT INTO ${table} (${cols}) VALUES (${vals});`
  })
  return `${create}\n\n${inserts.join('\n')}\n`
}
