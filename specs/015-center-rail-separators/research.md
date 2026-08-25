# Research — 015-center-rail-separators

## Observação

O trilho (`CenterRail`) lista ~9 grupos empilhados com `gap` e rótulos `.label`. Em captura de uso, a coluna parece um único bloco contínuo — difícil ver onde termina “Converter” e começa “Diferenças”.

## Decisão

Divisores horizontais estilo **linhas de tabela** (`border-bottom` em `.group`), não cards com fundo/sombra (evita ruído no trilho estreito de ~8rem e alinha a A-001).
