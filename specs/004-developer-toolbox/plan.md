# Plan — 004-developer-toolbox

## Constitution Check

| Princípio | Status |
|-----------|--------|
| JSON só no cliente | PASS |
| Domínio TS isolado | PASS (`shared/json/*`) |
| Sem cadastro | PASS |
| Sem Monaco (ADR-003) | PASS — mantém vanilla-jsoneditor |
| Pipeline entre ferramentas | PASS — Enviar à direita |
| Locale pt-BR | PASS |

## Abordagem

1. Domínio puro: `analyze`, `query`, `convert`, `codegen` + testes.
2. Pacotes: `jsonpath-plus`, `jmespath`, `js-yaml`, `fast-xml-parser`.
3. UI: `ToolboxPanel` acoplado ao `EditorWorkspace`; tema em `AppShell` + CSS vars.
4. Rotas lazy `/ferramentas/:slug` reutilizando o mesmo painel + texto SEO mínimo.
5. ADR-004 documenta engines modulares no domínio.

## Fora desta feature

002/003/009/010/011; R2+ do SRS (patch, mock, AI, share, JWT, API).
