# ADR-009: Toolbox R3 (JWT + HTTP + cURL)

## Status

Accepted — 2026-08-24

## Decision

JWT decode em `shared/json/jwt.ts` (base64url). HTTP em `shared/http/` com `fetch` no browser. cURL como string builder puro. Sem proxy API para CORS.

## Consequences

Share/Projects/AI permanecem fora do escopo. Azure deploy continua spec futura separada.
