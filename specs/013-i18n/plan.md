# Plan — 013-i18n

## Constitution Check

| Princípio | Status |
|-----------|--------|
| Front-only / JSON só no cliente | PASS — só UI/copy |
| Domínio TS isolado | PASS — `shared/i18n` sem React; `shared/json` intacto |
| Sem cadastro | PASS |
| Locale | UPDATE — pt + en (substitui “só pt-BR” no MVP) |
| Sem jobs/Blob de JSON | PASS |
| Tasks antes de código | PASS |

## Abordagem

1. `shared/i18n`: tipos, detect, persist, `t()`, catálogos `pt`/`en`, `applyLocaleToDocument`.
2. `LocaleProvider` no composition; seletor no `AppShell`.
3. Migrar copy de shell, TrustPages, ToolPages/catalog, EditorWorkspace, ComparePanel, CenterRail, ToolboxPanel.
4. Atualizar `AGENTS.md` / constitution (locale bilíngue).
5. ADR-011; testes Vitest; build; push → SWA.

## Fora desta feature

Rotas `/en`, hreflang (`011`), CMP (`003`), menus nativos do vanilla-jsoneditor.
