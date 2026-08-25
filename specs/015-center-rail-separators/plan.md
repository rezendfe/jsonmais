# Plan — 015-center-rail-separators

## Constitution Check

| Princípio | Status |
|-----------|--------|
| Front-only / JSON só no cliente | PASS — só CSS presentation |
| Domínio TS isolado | PASS — sem `shared/json` |
| Sem cadastro | PASS |
| Sem jobs/Blob de JSON | PASS |
| Tasks antes de código | PASS |

## Abordagem

1. Em `CenterRail.module.css`, tratar cada `.group` como “linha de tabela”: `border-bottom` com `var(--border)`, padding vertical leve; remover borda no `:last-child`.
2. Ajustar `gap` do `.rail` se o padding do grupo já separar o suficiente (evitar espaço + linha redundantes).
3. Build Vite; commit só desta feature; push `main` → workflow SWA.

## Fora desta feature

i18n (`013`), restyle amplo (`006`), accordion toolbox (`010`), CMP, SEO.
