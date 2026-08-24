# Feature Specification: Foundation (React + .NET hexagonal)

**Produto**: JSON Mais Portal  
**Feature Branch**: `000-foundation`  
**Created**: 2026-08-24  
**Status**: Implementing

**Input**: Esqueleto deployável da API e do front, boundaries hexagonais, health e sessão anônima — sem editor JSON ainda.

## Resumo executivo

Criar a solution ASP.NET Core hexagonal e a SPA React TypeScript com shell, health checks e cookie de sessão, prontos para `001`.

## Objetivos

- Solution `src/api` com Domain / Application / Infrastructure / Web
- App React em `src/web` com routing shell e composition
- CORS, HTTPS local, `/health` e `/health/ready`
- Porta de sessão anônima (in-memory)
- README de quickstart local

## Não-objetivos

- Editor JSON (`001`)
- CMP/ads (`003`)
- Infra Azure real (`009`)
- Upload ou persistência de JSON no servidor

## Personas

- **Dev/agente**: sobe API + web e valida health
- **Usuário final**: vê o shell; editor chega em `001`

## Assumptions

| ID | Assunção |
|----|----------|
| A-001 | .NET 10 e Node 22+ |
| A-002 | Monorepo neste workspace |
| A-003 | Cookie de sessão nome `jsonmais_sid` |
| A-004 | Locale UI MVP: pt-BR |

---

## User Scenarios & Testing

### US1 - Subir API e ver health (P1)

**Given** API iniciada, **When** `GET /health`, **Then** 200 com status Healthy.

### US2 - Front carrega shell (P1)

**Given** web iniciada, **When** abre `/`, **Then** vê shell do portal (placeholder do editor OK).

### US3 - Sessão anônima criada (P1)

**Given** primeira chamada à API com credentials, **When** não há cookie, **Then** API emite sessão e Set-Cookie.

### US4 - CORS (P2)

**Given** origin do front na allowlist, **When** browser chama API, **Then** CORS permite; outras origins bloqueadas.

---

## Requirements

### Functional

| ID | Requirement |
|----|-------------|
| RF-000-001 | Solution com 4 projetos Domain, Application, Infrastructure, Web |
| RF-000-002 | Composition root registra ports (sessão in-memory) |
| RF-000-003 | `GET /health` live; `GET /health/ready` |
| RF-000-004 | Middleware cria `SessionId` anônimo |
| RF-000-005 | React app com layout base e rota `/` |
| RF-000-006 | Env `VITE_API_BASE_URL` |
| RF-000-007 | CORS allowlist via config |

### Non-functional

| ID | Requirement |
|----|-------------|
| RN-000-001 | Domain sem ASP.NET |
| RN-000-002 | Headers de segurança básicos na API |
| RN-000-003 | Soft-fail: SPA sobe mesmo se a API estiver offline |

## Skills

`jsonmais-portal-sdd`, `jsonmais-portal-foundation`
