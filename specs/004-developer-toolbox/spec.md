# Feature Specification: Developer Toolbox (R1)

**Produto**: JSON Mais Portal  
**Feature Branch**: `004-developer-toolbox`  
**Created**: 2026-08-24  
**Status**: Done

**Input**: SRS JSON Developer Toolbox — MVP Release 1 (gaps além de `001-json-editor`).

## Resumo executivo

Estender o workspace dual-panel com um **painel de ferramentas** client-side: Analyze (inspector + estatísticas), Query playground (JSONPath / JMESPath), Convert (YAML / XML / CSV) e Code Generate (C# / TypeScript / Java / Python). Incluir dark mode, atalhos de teclado e rotas SEO por ferramenta. Manter marca **JSON Mais**, motor `vanilla-jsoneditor` e regra de não enviar o documento à API.

## Objetivos

- Estatísticas estruturais e inspeção de caminho (JSONPath / JSON Pointer)
- Playground de consulta JSONPath e JMESPath com copiar / enviar ao painel direito
- Conversão JSON ↔ YAML, JSON ↔ XML, JSON ↔ CSV (quando a forma permitir)
- Geração de código C#, TypeScript, Java e Python a partir do JSON
- Pipeline: resultado da ferramenta alimenta o editor (direita por padrão)
- Tema Light / Dark / System
- Atalhos: formatar, compactar, abrir/fechar toolbox
- Páginas SEO `/ferramentas/{slug}` com a mesma engine

## Não-objetivos

- Conta, projetos salvos, share, AI, JWT, API client, Mock, SQL, Schema Generator dedicado, JSON Patch/Merge (R2+)
- Migrar para Monaco Editor
- jq
- Enviar JSON à API
- Monetização Free/Pro

## Personas

- **Desenvolvedor**: consulta payload, gera types, converte YAML
- **QA / DevOps**: inspeciona estrutura, estatísticas, diff já existente em `001`

## Assumptions

| ID | Assunção |
|----|----------|
| A-001 | Fonte padrão das ferramentas = painel esquerdo; destino = painel direito |
| A-002 | Motores de query/convert/codegen vivem em `shared/json` (sem React) |
| A-003 | Transform nativo do `vanilla-jsoneditor` permanece; playground é UX explícita + pipeline |
| A-004 | CSV: apenas arrays de objetos planos ou objeto único achatado em uma linha |
| A-005 | Codegen é heurístico (tipos inferidos do sample), não OpenAPI |

---

## User Scenarios

### US1 - Estatísticas (P1)

**Given** JSON válido à esquerda, **When** abre Ferramentas → Analisar, **Then** vê contagens (objetos, arrays, strings, números, booleanos, nulls, profundidade, tamanho).

### US2 - Inspector (P1)

**Given** um caminho JSON Pointer ou JSONPath, **When** inspeciona, **Then** vê tipo, valor e pode copiar caminho/valor.

### US3 - Query (P1)

**Given** JSON à esquerda e expressão JSONPath ou JMESPath, **When** executa, **Then** vê o resultado e pode **Enviar à direita**.

### US4 - Convert (P1)

**Given** JSON válido, **When** escolhe YAML/XML/CSV, **Then** o texto convertido pode ser copiado ou enviado à direita.

### US5 - Codegen (P1)

**Given** JSON válido, **When** escolhe C#/TS/Java/Python, **Then** o código gerado pode ser copiado ou enviado à direita.

### US6 - Dark mode (P1)

**Given** a home, **When** escolhe Dark / Light / System, **Then** o tema persiste em localStorage e respeita preferência do SO no modo System.

### US7 - Atalhos (P2)

**Given** foco no workspace, **When** usa `Ctrl+Shift+F` / `Ctrl+Shift+M` / `Ctrl+Shift+T`, **Then** formata esquerda / compacta esquerda / alterna o painel de ferramentas.

### US8 - Rota SEO (P2)

**Given** `/ferramentas/json-to-typescript`, **When** abre, **Then** vê a ferramenta de geração TS com conteúdo explicativo e o mesmo motor local.

---

## Requisitos funcionais

| ID | Requisito |
|----|-----------|
| RF-004-001 | Painel Ferramentas no workspace (Analisar / Consultar / Converter / Gerar) |
| RF-004-002 | Estatísticas estruturais do documento fonte |
| RF-004-003 | Inspector por JSONPath ou JSON Pointer |
| RF-004-004 | Query JSONPath e JMESPath; copiar; enviar ao editor |
| RF-004-005 | Convert JSON→YAML/XML/CSV e reverse quando suportado |
| RF-004-006 | Codegen C#, TypeScript, Java, Python |
| RF-004-007 | Clipboard com feedback visual |
| RF-004-008 | Tema light/dark/system |
| RF-004-009 | Atalhos de teclado documentados na UI |
| RF-004-010 | Rotas SEO: formatter, validator (info), jsonpath, jmespath, json-to-yaml, json-to-xml, json-to-csv, json-to-csharp, json-to-typescript, json-to-java, json-to-python |

## Critérios de aceite (MVP R1)

1. Sem cadastro, tudo no browser.
2. Estatísticas e inspector funcionam sobre o painel esquerdo.
3. JSONPath e JMESPath retornam resultado e enviam à direita.
4. Conversões YAML/XML/CSV e reverses básicos.
5. Quatro geradores de código.
6. Dark mode e atalhos.
7. Rotas SEO listadas carregam a ferramenta.
8. Testes Vitest no domínio `shared/json`.
