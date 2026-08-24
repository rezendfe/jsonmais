# ADR-004: Engines do toolbox em shared/json

## Status

Accepted — 2026-08-24

## Context

O SRS de Developer Toolbox exige analyze, query, convert e codegen além do editor. Misturar essas regras no React ou no `vanilla-jsoneditor` quebraria testes e o gate de domínio puro.

## Decision

Implementar engines em `src/web/src/shared/json/` (`analyze`, `query`, `convert`, `codegen`). A UI em `presentation/toolbox` apenas orquestra entrada/saída e clipboard. Pacotes de terceiros (jsonpath-plus, jmespath, js-yaml, fast-xml-parser) só são importados pelo domínio TS, nunca pela API .NET.

## Consequences

Novas ferramentas R2+ seguem o mesmo padrão. O motor visual permanece ADR-003.
