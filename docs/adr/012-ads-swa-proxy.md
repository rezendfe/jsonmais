# ADR-012 — Proxy de creatives de ads no Static Web Apps

**Status:** Accepted  
**Date:** 2026-08-24  
**Product:** JSON Mais Portal

## Context

A Ads API Soluções Simples exige `X-Sistema-Key` e só libera CORS para origins cadastrados. O portal JSON Mais é front-only ([ADR-010](010-frontend-only.md)) e não possui App Service.

## Decision

- Faixa de banners no React (paridade PDF Mais): `AdBannerRow` antes do footer
- Creative via função gerenciada do Azure Static Web Apps em `GET /api/ads/creative`
- A função proxya a Ads API com `X-Sistema-Key` em app settings do SWA
- CMP no React; fetch só com Marketing=true e `VITE_ADS_ENABLED`
- Soft-fail: 204 / erro → slot omitido

## Consequences

- Não reintroduce App Service nem processamento de JSON no servidor
- `api_location` do workflow SWA aponta para `api/`
- Secrets `ADS_*` ficam no Azure (nunca no git / nunca em `VITE_*`)
