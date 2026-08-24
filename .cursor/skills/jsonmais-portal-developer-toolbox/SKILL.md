---
name: jsonmais-portal-developer-toolbox
description: >-
  Specialist for JSON Mais developer toolbox: analyze, JSONPath/JMESPath,
  convert YAML/XML/CSV/TOML, codegen, schema, patch, merge, mock, SQL, security.
  Use on specs/004-developer-toolbox and specs/005-toolbox-r2 and specs/009-toolbox-r3.
---

# JSON Mais — Especialista Developer Toolbox

## Invioláveis

1. Documento JSON não vai para a API
2. Engines só em `shared/json` (sem React / sem vanilla-jsoneditor)
3. Pipeline: resultado pode ir ao painel direito
4. Locale UI pt-BR
5. Sem Monaco; editor visual continua `vanilla-jsoneditor`

## R2 (`005`)

- `schema`, `patch`, `merge`, `transform`, `security`, `mock`, `sql`
- Patch/Merge: esquerda = base, direita = alvo
- TOML via `smol-toml` só no domínio

## R3 (`009`)

- JWT decode local (`shared/json/jwt.ts`)
- HTTP client + cURL (`shared/http/`)
- Sem proxy; CORS limita destinos
