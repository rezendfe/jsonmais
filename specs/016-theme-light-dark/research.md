# Research — 016-theme-light-dark

## Contexto

RF-004-008 original incluía `system` + `prefers-color-scheme`. Feedback de produto: só Claro e Escuro.

## Decisão

Preferência explícita binária. Remover `resolveTheme` e listener de `matchMedia`. Default `light` para valores inválidos (incluindo `system` salvo).
