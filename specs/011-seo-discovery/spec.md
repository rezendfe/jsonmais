# Feature Specification: SEO — Descoberta e Indexação

**Produto**: JSON Mais Portal  
**Feature Branch**: `011-seo-discovery`  
**Created**: 2026-08-24  
**Status**: Implemented  

**Input**: Motores de busca devem descobrir o editor, catálogo de ferramentas JSON e páginas de confiança via `robots.txt`, `sitemap.xml`, metadados por rota, JSON-LD e HTML pré-renderizado — sem migrar para SSR. Complemento GEO: FAQ por tool, `llms.txt` e IndexNow.

## Resumo executivo

O portal permanece SPA Vite em Azure Static Web Apps (100% front-end). No build, gera-se `robots.txt`, `sitemap.xml`, `llms.txt` e shells HTML por rota indexável (meta + canonical + JSON-LD + texto mínimo). No client, `SeoHead` sincroniza o head na navegação. Staging/preview não compete com produção na indexação.

## Objetivos

- `robots.txt` e `sitemap.xml` servidos como arquivos reais (não fallback SPA)
- Sitemap com editor (`/`), catálogo (`/ferramentas`), 25 tools SEO e páginas trust/legal
- Title, description, canonical e Open Graph únicos por rota
- JSON-LD (`WebSite` / `Organization` / `WebApplication` / `ItemList` / `FAQPage` / `BreadcrumbList`)
- Pré-render estático no build das rotas indexáveis
- Origem canônica via `VITE_PUBLIC_ORIGIN`
- Verificação Search Console via meta `google-site-verification` (CNAME em `jsonmais` impede TXT DNS)
- IndexNow key file + descoberta Bing/Yandex

## Não-objetivos

- Next.js ou SSR runtime
- hreflang / sitemap bilíngue (`013` i18n cobre UI apenas)
- Guias curados `/guias/*` (roadmap)
- Blog / keyword stuffing / conteúdo só para robôs
- Indexação de API legada (`src/api/` — ADR-010)
- Cadastro manual GSC/Bing (runbook humano pós-deploy)

## Assumptions

| ID | Assunção |
|----|----------|
| A-001 | Deploy SWA estático; sem App Service no fluxo JSON |
| A-002 | Slugs em `shared/seo/toolSlugs.ts` espelham `presentation/pages/toolCatalog.ts` |
| A-003 | Copy SEO indexável em **pt-BR** (`html lang="pt-BR"`) |
| A-004 | Domínio canônico prod: `https://jsonmais.solucaosimples.com.br` |
| A-005 | Pré-render de build é a estratégia SEO (sem Next.js) |
| A-006 | Subdomínio `jsonmais` usa CNAME → SWA; verificação GSC via meta tag, não TXT |

---

## User Scenarios & Testing

### US1 - Descoberta via robots + sitemap (P1)

**Given** deploy de produção, **When** `GET /robots.txt`, **Then** `Allow: /` e `Sitemap: {ORIGIN}/sitemap.xml`.  
**Given** `GET /sitemap.xml`, **Then** XML com URLs absolutas do editor, ferramentas e trust/legal.

### US2 - Meta por ferramenta (P1)

**Given** crawler ou usuário em `/ferramentas/json-formatter`, **When** inspeciona head, **Then** title, description e canonical específicos.

### US3 - Conteúdo sem JS (P1)

**Given** fetch da URL **sem** JavaScript, **When** lê o HTML, **Then** vê H1, descrição, CTA “Sem cadastro. O JSON nunca sai do navegador.” e JSON-LD.

### US4 - Preview não indexa (P1)

**Given** ambiente staging/preview SWA, **When** crawler consulta, **Then** `robots.txt` com `Disallow: /`.

### US5 - Navegação SPA mantém SEO (P2)

**Given** usuário navega editor → tool no client, **When** troca de rota, **Then** `document.title` e meta tags atualizam via `SeoHead`.

---

## Requirements

| ID | Requirement |
|----|-------------|
| RF-011-001 | `robots.txt` gerado no build; `Allow: /` em prod; linha `Sitemap` absoluta |
| RF-011-002 | Staging/preview: `Disallow: /` quando origem ≠ prod e `VITE_SEO_INDEX` não forçado |
| RF-011-003 | `sitemap.xml` gerado no build; URLs absolutas; `lastmod` = data do build |
| RF-011-004 | Prioridades: editor 1.0; catálogo 0.9; tools 0.8; trust/legal 0.4–0.6 |
| RF-011-005 | SWA `navigationFallback.exclude` inclui robots, sitemap, llms, paths pré-renderizados |
| RF-011-006 | Por rota: `<title>` único, `meta description`, `link rel="canonical"` absoluto |
| RF-011-007 | Open Graph / Twitter Card: title, description, url, locale, site_name, imagem |
| RF-011-008 | Regra canônica: HTTPS, host prod, sem trailing slash (exceto `/`) |
| RF-011-009 | JSON-LD hub/tool/trust conforme tipo de página; FAQPage quando houver FAQ |
| RF-011-010 | Pré-render no `vite build`: HTML por rota indexável |
| RF-011-011 | `SeoHead` sincroniza head na navegação client |
| RF-011-012 | `VITE_PUBLIC_ORIGIN` no CI; default = domínio prod |
| RF-011-013 | Um `h1` por página indexável no shell pré-renderizado |
| RF-011-014 | Slugs pt-BR estáveis sob `/ferramentas/*` |
| RF-011-015 | 404 dedicado com `noindex` |
| RF-011-016 | Meta `google-site-verification` em `index.html` |
| RF-011-017 | CMP/ads não ocultam conteúdo indexável para crawlers |
| RF-011-018 | Páginas trust: `/sobre`, `/como-funciona`, `/privacidade`, `/cookies` |
| RF-011-019 | FAQ por tool (≥4 itens com SHARED_FAQ) para schema FAQPage |
| RF-011-020 | `llms.txt` na origem |
| RF-011-021 | IndexNow: arquivo de chave publicado no build |

## Success Criteria

| ID | Criterion |
|----|-----------|
| SC-011-001 | `GET /robots.txt` e `GET /sitemap.xml` retornam arquivos reais, não HTML da SPA |
| SC-011-002 | Sitemap lista 31 URLs (editor + catálogo + 25 tools + 4 trust) |
| SC-011-003 | Fetch sem JS de `/ferramentas/json-formatter` contém meta/JSON-LD específicos |
| SC-011-004 | Preview/staging não indexa produção |
| SC-011-005 | Build + testes SEO passam; deploy SWA publica assets |

## Out of Scope

- SSR / Next.js  
- hreflang / SEO EN  
- Guias `/guias/*`  
- API legada no sitemap  

## Skills

| Skill | Papel |
|-------|--------|
| `jsonmais-portal-sdd` | Workflow SDD |
| `jsonmais-portal-foundation` | Vite, SWA shell |
| `jsonmais-portal-azure` | SWA config, domínio |
| `jsonmais-portal-developer-toolbox` | Rotas `/ferramentas` |

## References

- Constituição: `AGENTS.md`  
- Hosting: `specs/009-azure-deploy/`, ADR-010 front-only  
- i18n UI: `specs/013-i18n/` (SEO pt-BR separado)  
- Modelo: `Portais/PDFMais/specs/011-seo-descoberta/`
