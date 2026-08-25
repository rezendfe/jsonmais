# Architecture — 016-theme-light-dark

## Escopo

```text
AppShell (select Tema)
    └── shared/theme/theme.ts  (read / write / apply)
            └── localStorage  jsonmais.theme.v1
            └── document.documentElement.dataset.theme
```

## Dependências

Nenhuma biblioteca nova. Sem `matchMedia('(prefers-color-scheme)')`.
