# Feature Specification: Cookies, consentimento (CMP) e anúncios

**Produto**: JSON Mais Portal  
**Feature Branch**: `003-cookies-consent-ads`  
**Created**: 2026-08-24  
**Status**: Implementing

**Input**: Banner CMP; essenciais vs marketing; faixa de banners antes do footer (paridade PDF Mais); soft-fail sem quadros vazios; creative via proxy SWA (sem App Service).

## Resumo

CMP antes de cookies/scripts de marketing. Aceite permite até 2 banners na base (`bottom_left` / `bottom_right`). Recusa mantém editor e toolbox usáveis. Creative vem de `GET /api/ads/creative` (função gerenciada do Static Web Apps que proxya a Ads API Soluções Simples com `X-Sistema-Key` só no servidor).

## Requirements

| ID | Requirement |
|----|-------------|
| RF-003-001 | CMP na primeira visita |
| RF-003-002 | Essenciais + Marketing |
| RF-003-003 | Aceitar / Rejeitar / Gerenciar |
| RF-003-004 | Bloquear fetch creative até Marketing |
| RF-003-005 | Persistência da escolha |
| RF-003-006 | Proxy SWA `GET /api/ads/creative` |
| RF-003-007 | Até 2 banners antes do footer; só com creative; clique → nova janela |
| RF-003-008 | Links privacidade + cookies |
| RF-003-009 | Sem placeholders/quadros vazios |
| RF-003-010 | Soft-fail ads (omitir slot) |

## Success Criteria

| ID | Criterion |
|----|-----------|
| SC-003-001 | Sem consent → zero `/api/ads/creative` |
| SC-003-002 | Reject → portal OK; sem quadros vazios |
| SC-003-003 | Accept + fill → banner pode renderizar |
| SC-003-004 | Falha ads não quebra editor |
