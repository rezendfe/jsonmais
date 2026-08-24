# Feature Specification: Developer Toolbox R2

**Produto**: JSON Mais Portal  
**Feature Branch**: `005-toolbox-r2`  
**Created**: 2026-08-24  
**Status**: Done

**Input**: SRS JSON Developer Toolbox — Release 2 (gaps além de `004-developer-toolbox`).

## Resumo executivo

Estender o toolbox client-side com Schema Generator (Draft 2020-12), JSON Patch (RFC 6902), Merge, Flatten/Unflatten, Sort, Mock, SQL (CREATE/INSERT), Security Scanner + Mask, codegen Go/Kotlin e convert TOML/Markdown. Manter engines em `shared/json`, pipeline L→R e marca JSON Mais.

## Objetivos

- Gerar JSON Schema a partir do sample
- Gerar e aplicar JSON Patch (esquerda = base, direita = alvo)
- Merge shallow / deep / overwrite (L + R)
- Flatten / Unflatten / Sort de chaves e arrays
- Scanner de dados sensíveis + mascaramento
- Mock heurístico (N=1..1000)
- SQL CREATE TABLE + INSERT (sqlite, postgres, mysql, sqlserver)
- Codegen Go e Kotlin; convert TOML e Markdown table
- Rotas SEO para as novas ferramentas

## Não-objetivos

- JWT, API client, Share, AI, contas (R3+/extensões)
- Swift / Rust codegen
- jq
- Enviar JSON à API
- Lib faker externa

## Assumptions

| ID | Assunção |
|----|----------|
| A-001 | Fonte padrão = painel esquerdo; destino = direito |
| A-002 | Patch/Merge usam esquerda (base) e direita (alvo / segundo documento) |
| A-003 | Schema é heurístico Draft 2020-12 |
| A-004 | Mock deriva tipos/nomes do sample, sem rede |
| A-005 | SQL assume array de objetos planos ou objeto único |

## User Scenarios

### US1 - Schema (P1)

**Given** JSON válido à esquerda, **When** gera schema, **Then** vê Draft 2020-12 e pode enviar à direita.

### US2 - Patch (P1)

**Given** JSON L e R, **When** gera patch, **Then** obtém RFC 6902; **When** aplica patch na base, **Then** produz documento resultante.

### US3 - Merge (P1)

**Given** L e R, **When** escolhe modo merge, **Then** resultado combinado pode ir à direita.

### US4 - Transform (P1)

**Given** JSON, **When** flatten/unflatten/sort, **Then** resultado disponível no pipeline.

### US5 - Security (P1)

**Given** JSON, **When** escaneia, **Then** lista caminhos suspeitos; **When** mascara, **Then** valores sensíveis ofuscados.

### US6 - Mock / SQL (P1)

**Given** sample, **When** gera mock ou SQL, **Then** texto copiável / enviável.

### US7 - Convert / Codegen extras (P2)

**Given** JSON, **When** TOML/Markdown ou Go/Kotlin, **Then** saída no painel.

### US8 - SEO (P2)

**Given** `/ferramentas/{slug}` R2, **When** abre, **Then** ferramenta correspondente carrega.

## Requisitos funcionais

| ID | Requisito |
|----|-----------|
| RF-005-001 | Aba Transformar (flatten, unflatten, sort, patch, merge) |
| RF-005-002 | Aba Schema — generateJsonSchema |
| RF-005-003 | Aba Segurança — scan + mask |
| RF-005-004 | Aba Mock — generateMock(count) |
| RF-005-005 | Aba SQL — jsonToSql dialetos listados |
| RF-005-006 | Codegen go + kotlin |
| RF-005-007 | Convert TOML ↔ JSON e Markdown table |
| RF-005-008 | Pipeline enviar à direita + clipboard |
| RF-005-009 | Rotas SEO R2 |

## Critérios de aceite

1. Engines só em `shared/json`; testes Vitest.
2. Patch/Merge usam L e R do workspace.
3. Nenhum documento JSON enviado à API.
4. Build web limpo; locale pt-BR.
