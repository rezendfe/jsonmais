# Feature Specification: Portal 100% front-end (sem API)

**Produto**: JSON Mais Portal  
**Feature Branch**: `012-frontend-only`  
**Created**: 2026-08-24  
**Status**: Done

**Input**: Não subir API — todo comportamento do portal no React + domínio TS; deploy estático único.

## Resumo executivo

Eliminar a dependência runtime de `src/api` (ASP.NET). O portal passa a ser uma **SPA estática**: editor, toolbox, sessão anônima, privacidade, CMP/ads (futuro) e SEO rodam no browser. Nenhuma requisição ao backend no fluxo normal.

## Objetivos

- Deploy apenas de `src/web` (build Vite → arquivos estáticos)
- Sessão anônima **client-side** (UUID em `localStorage`)
- Remover ou no-op de `ensureSession`/`endSession` que chamam HTTP
- Atualizar copy de privacidade/sobre (sem menção a “API do portal”)
- Headers de segurança no `staticwebapp.config.json` (sem depender da API)
- Constituição (`AGENTS.md`) alinhada a front-only

## Não-objetivos

- Reimplementar toolbox ou editor (já client-side)
- Conta, login, share URL, AI (`009-toolbox-r3` etc.)
- Migrar ads server-side — CMP continua no React (`003`)
- Obrigar delete imediato de `src/api/` (pode ficar arquivado no repo)

## Assumptions

| ID | Assunção |
|----|----------|
| A-012-001 | Hosting estático com fallback SPA (`navigationFallback`) |
| A-012-002 | `localStorage` disponível; sem ele, portal funciona sem ID persistente |
| A-012-003 | Chave de sessão local: `jsonmais_client_id` (substitui cookie `jsonmais_sid`) |
| A-012-004 | Vitest cobre módulo `shared/session`; não exige xUnit para esta feature |

---

## User Scenarios & Testing

### US1 - Deploy estático (P1)

**Given** build de produção do web, **When** publicado em SWA/CDN, **Then** editor e toolbox funcionam **sem** App Service ou API.

### US2 - Sessão local (P1)

**Given** primeira visita, **When** app carrega, **Then** cria ou reutiliza UUID em `localStorage` sem fetch de rede.

### US3 - Encerrar sessão local (P1)

**Given** página `/privacidade`, **When** usuário encerra sessão, **Then** remove `jsonmais_client_id` e opcionalmente limpa workspace — sem HTTP.

### US4 - Offline / sem backend (P1)

**Given** nenhum servidor de API, **When** usuário abre o portal, **Then** editor e ferramentas operam normalmente.

### US5 - Privacidade honesta (P2)

**Given** FAQ e `/privacidade`, **When** usuário lê, **Then** texto afirma que **nada** sai do device (sem “API de health/sessão”).

---

## Requirements

### Functional

| ID | Requirement |
|----|-------------|
| RF-012-001 | Módulo `shared/session/clientSession.ts`: `ensureClientSession()`, `endClientSession()`, `maskSessionId()` |
| RF-012-002 | `AppShell` e `TrustPages` usam sessão local; zero import de `shared/api/http` para sessão |
| RF-012-003 | Remover uso de `VITE_API_BASE_URL` no runtime do portal (env example atualizado) |
| RF-012-004 | `staticwebapp.config.json`: headers globais + rotas SPA; **sem** proxy `/api/* |
| RF-012-005 | Copy pt-BR: About, FAQ, Privacidade — “100% no navegador”, sem referência a API |
| RF-012-006 | Quickstart: só `npm run dev` / `npm run build`; sem `dotnet run` |

### Non-functional

| ID | Requirement |
|----|-------------|
| RN-012-001 | `shared/json` e `shared/session` não importam React |
| RN-012-002 | Build web e testes Vitest passam sem API rodando |
| RN-012-003 | Nenhum secret ou URL de API obrigatória em produção |

## Out of Scope

- Endpoints REST novos em qualquer servidor
- Banco de dados
- Sincronização multi-device do workspace

## Skills

`jsonmais-portal-sdd`, `jsonmais-portal-foundation` (escopo web-only), `jsonmais-portal-session-privacy`

## ADR

[docs/adr/010-frontend-only.md](../../docs/adr/010-frontend-only.md)
