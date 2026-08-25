# Research — 014-shell-footer-chrome

## Observação

O header usa `--header-bg` translúcido + `backdrop-filter` + texto `--ink`. O footer pós-`006` ficou navy (`#0b1220`), criando contraste “barra escura” abaixo do shell claro.

## Decisão

Reusar a superfície do header no footer (A-001 da spec), em vez de um cinza sólido separado — garante paridade light/dark sem novo token de cor.
