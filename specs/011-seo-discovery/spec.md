# Feature Specification: SEO descoberta (MVP)

**Produto**: JSON Mais Portal  
**Feature Branch**: `011-seo-discovery`  
**Created**: 2026-08-24  
**Status**: Done

## Resumo

robots.txt, sitemap.xml estático e meta tags Open Graph básicas para indexação.

## Requirements

| ID | Requisito |
|----|-----------|
| RF-011-001 | `public/robots.txt` permite crawlers e aponta sitemap |
| RF-011-002 | `public/sitemap.xml` com rotas principais e ferramentas SEO |
| RF-011-003 | Meta OG/Twitter em `index.html` |

## Não-objetivos

- Pré-render SSR
- hreflang / i18n
