# Plan — 014-shell-footer-chrome

## Constitution Check

| Princípio | Status |
|-----------|--------|
| Front-only / JSON só no cliente | PASS — só CSS/tokens |
| Domínio TS isolado | PASS — sem `shared/json` |
| Sem cadastro | PASS |
| Sem jobs/Blob de JSON | PASS |
| Tasks antes de código | PASS |

## Abordagem

1. Em `index.css`, reapontar `--footer-bg` / `--footer-ink` / `--footer-muted` para espelhar header/chrome (`--header-bg`, `--ink`, `--muted`) em light e dark.
2. Em `AppShell.module.css`, alinhar bordas do footer/copyright a `var(--border)`; opcional `backdrop-filter` igual ao header se o fundo for translúcido.
3. Build Vite; commit só desta feature; push `main` → workflow SWA.

## Fora desta feature

i18n (`013`), restyle amplo (`006`), CMP, SEO.
