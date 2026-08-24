# ADR-005: Engines Toolbox R2

## Status

Accepted — 2026-08-24

## Context

O SRS Release 2 exige schema, patch, merge, transform, security, mock e SQL além do R1. As regras devem permanecer testáveis sem React.

## Decision

Novos módulos em `src/web/src/shared/json/`: `schema`, `patch`, `merge`, `transform`, `security`, `mock`, `sql`. TOML via `smol-toml` importado só no domínio. UI em `ToolboxPanel` orquestra L/R e clipboard.

## Consequences

R3+ (JWT, API, Share, AI) seguirá o mesmo padrão. Motor visual permanece ADR-003.
