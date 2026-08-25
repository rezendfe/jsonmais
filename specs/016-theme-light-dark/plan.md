# Plan — 016-theme-light-dark

## Constitution Check

| Princípio | Status |
|-----------|--------|
| Front-only / JSON só no cliente | PASS — só preferência local |
| Domínio TS isolado | PASS — `shared/theme` sem React |
| Sem cadastro | PASS |
| Sem jobs/Blob de JSON | PASS |
| Tasks antes de código | PASS |

## Abordagem

1. Estreitar `ThemePreference` em `shared/theme/theme.ts`; remover `resolveTheme`.
2. `AppShell`: default `light`; aplicar tema direto; options só light/dark.
3. Atualizar `004` (RF-004-008) para refletir light/dark.
4. Build Vite; commit scoped; push `main` → workflow SWA.

## Fora desta feature

i18n (`013`), CMP (`003`), SEO (`011`).
