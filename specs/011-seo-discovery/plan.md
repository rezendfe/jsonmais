# Plan — 011-seo-discovery

## Constitution Check

| Princípio | Atende? |
|-----------|---------|
| Front-only / JSON no cliente | Sim — SEO só marketing/tools; documento JSON fora do escopo |
| Domínio isolado | Sim — `shared/seo` TS puro; React só `SeoHead` |
| Sem cadastro | Sim — offers JSON-LD gratuitos |
| Consentimento antes ads | Sim — CMP não bloqueia crawl |
| Sem secrets no repo | Sim — IndexNow key pública; GSC meta no HTML |
| Azure-first | Sim — SWA serve estáticos |
| Tasks antes de código | Sim — spec + tasks atualizados |

**Resultado:** PASS

## Approach

1. Modelo `SeoPage` + registry em `shared/seo/pages.ts` (slugs, trust, editor)
2. Plugin Vite `seoPrerenderPlugin`: pós-build gera robots, sitemap, llms, IndexNow key e HTML por rota
3. `SeoHead` + `applyDocumentSeo` sincronizam head na navegação SPA
4. `staticwebapp.config.json`: exclude paths pré-renderizados + 404 noindex
5. CI: `VITE_PUBLIC_ORIGIN` + `VITE_SEO_INDEX=true` no workflow SWA

## Dependencies

- `000` foundation Vite  
- `004`/`005` rotas SEO `/ferramentas/:slug`  
- `009` Azure SWA + domínio `jsonmais.solucaosimples.com.br`  
- `013` i18n UI (SEO permanece pt-BR)

## Skills

`jsonmais-portal-sdd` → `foundation` + `azure` + `developer-toolbox`
