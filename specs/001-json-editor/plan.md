# Plan — 001-json-editor

## Constitution Check

| Princípio | Status |
|-----------|--------|
| JSON só no cliente | PASS |
| Domínio TS isolado | PASS (`shared/json`) |
| Sem cadastro | PASS |
| Motor não vaza para Domain C# | PASS |

## Abordagem

1. Domínio: `formatJson`, `compactJson`, `structuralDiff`, `documentStore` (localStorage).
2. Adapter React `JsonEditorPane` envolvendo `createJSONEditor`.
3. `EditorWorkspace`: dois panes, toolbar, splitter, compare usando o domínio.
4. Rota `/` = workspace em tela cheia; páginas de confiança mínimas (sobre, privacidade).

Pacote: `vanilla-jsoneditor` (ADR-003).
