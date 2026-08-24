export type CodeLanguage = 'csharp' | 'typescript' | 'java' | 'python' | 'go' | 'kotlin'

export function codeLanguageExtension(language: CodeLanguage): string {
  switch (language) {
    case 'typescript':
      return '.ts'
    case 'csharp':
      return '.cs'
    case 'java':
      return '.java'
    case 'python':
      return '.py'
    case 'go':
      return '.go'
    case 'kotlin':
      return '.kt'
  }
}

export function codeLanguageFilename(language: CodeLanguage, rootName = 'Root'): string {
  return `${rootName}${codeLanguageExtension(language)}`
}

type InferredType =
  | { kind: 'null' }
  | { kind: 'string' }
  | { kind: 'number' }
  | { kind: 'boolean' }
  | { kind: 'any' }
  | { kind: 'array'; item: InferredType }
  | { kind: 'object'; name: string; fields: Record<string, InferredType> }

function pascalCase(name: string): string {
  const cleaned = name.replace(/[^A-Za-z0-9]+/g, ' ').trim()
  if (!cleaned) return 'Root'
  return cleaned
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

function camelCase(name: string): string {
  const p = pascalCase(name)
  return p.charAt(0).toLowerCase() + p.slice(1)
}

function mergeTypes(a: InferredType, b: InferredType): InferredType {
  if (a.kind === b.kind) {
    if (a.kind === 'array' && b.kind === 'array') {
      return { kind: 'array', item: mergeTypes(a.item, b.item) }
    }
    if (a.kind === 'object' && b.kind === 'object') {
      const keys = new Set([...Object.keys(a.fields), ...Object.keys(b.fields)])
      const fields: Record<string, InferredType> = {}
      for (const key of keys) {
        const left = a.fields[key]
        const right = b.fields[key]
        if (left && right) fields[key] = mergeTypes(left, right)
        else fields[key] = left ?? right!
      }
      return { kind: 'object', name: a.name, fields }
    }
    return a
  }
  if (a.kind === 'null') return b
  if (b.kind === 'null') return a
  return { kind: 'any' }
}

function infer(value: unknown, name: string): InferredType {
  if (value === null) return { kind: 'null' }
  if (Array.isArray(value)) {
    if (value.length === 0) return { kind: 'array', item: { kind: 'any' } }
    return {
      kind: 'array',
      item: value.slice(1).reduce<InferredType>((acc, item) => mergeTypes(acc, infer(item, name)), infer(value[0], name)),
    }
  }
  switch (typeof value) {
    case 'string':
      return { kind: 'string' }
    case 'number':
      return { kind: 'number' }
    case 'boolean':
      return { kind: 'boolean' }
    case 'object': {
      const fields: Record<string, InferredType> = {}
      for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
        fields[key] = infer(child, pascalCase(key))
      }
      return { kind: 'object', name: pascalCase(name), fields }
    }
    default:
      return { kind: 'any' }
  }
}

function collectObjects(type: InferredType, bag: Map<string, InferredType>): void {
  if (type.kind === 'array') {
    collectObjects(type.item, bag)
    return
  }
  if (type.kind !== 'object') return
  let name = type.name
  let n = 2
  while (bag.has(name) && JSON.stringify(bag.get(name)) !== JSON.stringify(type)) {
    name = `${type.name}${n}`
    n += 1
  }
  const renamed = name === type.name ? type : { ...type, name }
  bag.set(name, renamed)
  for (const field of Object.values(renamed.fields)) {
    collectObjects(field, bag)
  }
}

function tsType(type: InferredType): string {
  switch (type.kind) {
    case 'null':
      return 'null'
    case 'string':
      return 'string'
    case 'number':
      return 'number'
    case 'boolean':
      return 'boolean'
    case 'any':
      return 'unknown'
    case 'array':
      return `${tsType(type.item)}[]`
    case 'object':
      return type.name
  }
}

function csharpType(type: InferredType): string {
  switch (type.kind) {
    case 'null':
      return 'object?'
    case 'string':
      return 'string'
    case 'number':
      return 'double'
    case 'boolean':
      return 'bool'
    case 'any':
      return 'object?'
    case 'array':
      return `List<${csharpType(type.item)}>`
    case 'object':
      return type.name
  }
}

function javaType(type: InferredType): string {
  switch (type.kind) {
    case 'null':
      return 'Object'
    case 'string':
      return 'String'
    case 'number':
      return 'Double'
    case 'boolean':
      return 'Boolean'
    case 'any':
      return 'Object'
    case 'array':
      return `List<${javaType(type.item)}>`
    case 'object':
      return type.name
  }
}

function pythonType(type: InferredType): string {
  switch (type.kind) {
    case 'null':
      return 'None'
    case 'string':
      return 'str'
    case 'number':
      return 'float'
    case 'boolean':
      return 'bool'
    case 'any':
      return 'Any'
    case 'array':
      return `list[${pythonType(type.item)}]`
    case 'object':
      return type.name
  }
}

function emitTypescript(root: InferredType): string {
  const bag = new Map<string, InferredType>()
  collectObjects(root, bag)
  const blocks: string[] = []
  for (const obj of bag.values()) {
    if (obj.kind !== 'object') continue
    const lines = Object.entries(obj.fields).map(([key, field]) => `  ${key}: ${tsType(field)};`)
    blocks.push(`export interface ${obj.name} {\n${lines.join('\n')}\n}`)
  }
  if (root.kind !== 'object') {
    blocks.push(`export type Root = ${tsType(root)};`)
  }
  return `${blocks.join('\n\n')}\n`
}

function emitCsharp(root: InferredType): string {
  const bag = new Map<string, InferredType>()
  collectObjects(root, bag)
  const blocks: string[] = ['using System.Collections.Generic;', 'using System.Text.Json.Serialization;', '']
  for (const obj of bag.values()) {
    if (obj.kind !== 'object') continue
    const lines = Object.entries(obj.fields).map(([key, field]) => {
      const prop = pascalCase(key)
      return `    [JsonPropertyName("${key}")]\n    public ${csharpType(field)} ${prop} { get; set; }`
    })
    blocks.push(`public class ${obj.name}\n{\n${lines.join('\n\n')}\n}`)
  }
  if (root.kind !== 'object') {
    blocks.push(`// Root type: ${csharpType(root)}`)
  }
  return `${blocks.join('\n\n')}\n`
}

function emitJava(root: InferredType): string {
  const bag = new Map<string, InferredType>()
  collectObjects(root, bag)
  const blocks: string[] = ['import java.util.List;', '']
  for (const obj of bag.values()) {
    if (obj.kind !== 'object') continue
    const lines = Object.entries(obj.fields).map(([key, field]) => {
      const prop = camelCase(key)
      const type = javaType(field)
      return `    private ${type} ${prop};\n\n    public ${type} get${pascalCase(key)}() { return ${prop}; }\n    public void set${pascalCase(key)}(${type} value) { this.${prop} = value; }`
    })
    blocks.push(`public class ${obj.name} {\n${lines.join('\n\n')}\n}`)
  }
  if (root.kind !== 'object') {
    blocks.push(`// Root type: ${javaType(root)}`)
  }
  return `${blocks.join('\n\n')}\n`
}

function emitPython(root: InferredType): string {
  const bag = new Map<string, InferredType>()
  collectObjects(root, bag)
  const blocks: string[] = ['from __future__ import annotations', 'from typing import Any', 'from dataclasses import dataclass', '']
  for (const obj of [...bag.values()].reverse()) {
    if (obj.kind !== 'object') continue
    const lines = Object.entries(obj.fields).map(([key, field]) => `    ${key}: ${pythonType(field)}`)
    blocks.push(`@dataclass\nclass ${obj.name}:\n${lines.length ? lines.join('\n') : '    pass'}`)
  }
  if (root.kind !== 'object') {
    blocks.push(`# Root type: ${pythonType(root)}`)
  }
  return `${blocks.join('\n\n')}\n`
}

function goType(type: InferredType): string {
  switch (type.kind) {
    case 'null':
      return 'any'
    case 'string':
      return 'string'
    case 'number':
      return 'float64'
    case 'boolean':
      return 'bool'
    case 'any':
      return 'any'
    case 'array':
      return `[]${goType(type.item)}`
    case 'object':
      return type.name
  }
}

function kotlinType(type: InferredType): string {
  switch (type.kind) {
    case 'null':
      return 'Any?'
    case 'string':
      return 'String'
    case 'number':
      return 'Double'
    case 'boolean':
      return 'Boolean'
    case 'any':
      return 'Any?'
    case 'array':
      return `List<${kotlinType(type.item)}>`
    case 'object':
      return type.name
  }
}

function emitGo(root: InferredType): string {
  const bag = new Map<string, InferredType>()
  collectObjects(root, bag)
  const blocks: string[] = ['package main', '']
  for (const obj of bag.values()) {
    if (obj.kind !== 'object') continue
    const lines = Object.entries(obj.fields).map(([key, field]) => {
      const prop = pascalCase(key)
      return `\t${prop} ${goType(field)} \`json:"${key}"\``
    })
    blocks.push(`type ${obj.name} struct {\n${lines.join('\n')}\n}`)
  }
  if (root.kind !== 'object') {
    blocks.push(`// Root type: ${goType(root)}`)
  }
  return `${blocks.join('\n\n')}\n`
}

function emitKotlin(root: InferredType): string {
  const bag = new Map<string, InferredType>()
  collectObjects(root, bag)
  const blocks: string[] = []
  for (const obj of bag.values()) {
    if (obj.kind !== 'object') continue
    const lines = Object.entries(obj.fields).map(([key, field]) => `    val ${camelCase(key)}: ${kotlinType(field)}`)
    blocks.push(`data class ${obj.name}(\n${lines.join(',\n')}\n)`)
  }
  if (root.kind !== 'object') {
    blocks.push(`// Root type: ${kotlinType(root)}`)
  }
  return `${blocks.join('\n\n')}\n`
}

export function generateCode(value: unknown, language: CodeLanguage, rootName = 'Root'): string {
  const inferred = infer(value, rootName)
  switch (language) {
    case 'csharp':
      return emitCsharp(inferred)
    case 'typescript':
      return emitTypescript(inferred)
    case 'java':
      return emitJava(inferred)
    case 'python':
      return emitPython(inferred)
    case 'go':
      return emitGo(inferred)
    case 'kotlin':
      return emitKotlin(inferred)
  }
}
