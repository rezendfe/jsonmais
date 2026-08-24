# Research — 004-developer-toolbox

## Query

- **JSONPath**: `jsonpath-plus` — API estável, tipada.
- **JMESPath**: `jmespath` — alinhado a AWS/docs comuns.

## Convert

- **YAML**: `js-yaml` (dump/load).
- **XML**: `fast-xml-parser` (objeto ↔ XML).
- **CSV**: implementação própria para arrays de objetos planos.

## Codegen

Inferência recursiva de tipos a partir do sample (união de tipos em arrays). Suficiente para MVP; sem templates externos.

## Theme

`prefers-color-scheme` + atributo `data-theme` em `document.documentElement`.

## Decisão

Não adotar Monaco nem reimplementar tree — ADR-003 permanece.
