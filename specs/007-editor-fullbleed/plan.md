# Plan — 007-editor-fullbleed

## Constitution Check

| Princípio | Status |
|-----------|--------|
| JSON só no cliente | PASS |
| `/` = editor | PASS |
| Locale pt-BR | PASS |
| Tasks antes de código | PASS |

## Abordagem

1. `AppShell`: mode `shellEditor` — fluxo em coluna; `mainWide` com `min-height: calc(100dvh - header)`.
2. Workspace `height: 100%` no editor.
3. Cards do hub: tile com iniciais + estilos 123tools-like.
4. Sem mudança de domínio TS / API.
