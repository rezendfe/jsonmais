# ADR-010: Portal 100% front-end (sem API deployável)

## Status

Accepted — 2026-08-24

Supersedes parcialmente [ADR-001](001-hexagonal-api.md) (API hexagonal de suporte deixa de ser requisito de deploy).

## Context

O MVP já processa JSON inteiramente no browser ([ADR-002](002-json-client-side.md)). A API ASP.NET existente só oferece health, cookie de sessão anônima e infra HTTP (CORS, headers). Isso impõe deploy duplo (Static Web App + App Service), custo operacional e complexidade de desenvolvimento local sem benefício funcional para o usuário.

O produtor do projeto decidiu **não subir API** — apenas o build estático do React.

## Decision

1. **Deploy único**: SPA React (`src/web`) em hosting estático (Azure Static Web Apps ou equivalente).
2. **Sem chamadas HTTP ao backend** no fluxo normal do portal — remover dependência de `VITE_API_BASE_URL` e endpoints `/health`, `/api/session`.
3. **Identificador anônimo local**: UUID em `localStorage` (`jsonmais_client_id`), gerido em `shared/session/` (TypeScript puro), não cookie HttpOnly de servidor.
4. **CMP, ads, SEO, privacidade**: 100% no React; headers de segurança via `staticwebapp.config.json` / CDN.
5. **`src/api/`**: código legado — não entra no pipeline de deploy; remoção opcional em task futura, não bloqueante.

## Consequences

- Menor superfície de ataque e zero cold start de API.
- Sessão não é compartilhável entre dispositivos (já era o caso com cookie local).
- ADR-001 permanece documentação histórica da foundation; novas features não adicionam endpoints .NET.
- Specs `000-foundation` e `002-session-privacy` permanecem como registro histórico; comportamento observável migra para `012-frontend-only`.
