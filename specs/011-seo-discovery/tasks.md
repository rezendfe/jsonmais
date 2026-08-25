# Tasks — 011-seo-discovery

| ID | Task | RF | Status |
|----|------|-----|--------|
| T001 | Registry `SeoPage` + `toolSlugs` + helpers canonical/JSON-LD | RF-011-003,006,008,009 | Done |
| T002 | Plugin build: `robots.txt` + `sitemap.xml` + `llms.txt` (prod vs staging) | RF-011-001,002,003,004,012,020,021 | Done |
| T003 | Pós-build: pré-render HTML shells por rota indexável | RF-011-010,013 | Done |
| T004 | `SeoHead` + `applyDocumentSeo`; wiring no router | RF-011-006,007,011 | Done |
| T005 | SWA: exclude robots/sitemap/llms/prerender; 404 noindex | RF-011-005,015 | Done |
| T006 | `VITE_PUBLIC_ORIGIN` / `VITE_SEO_INDEX` no workflow CI | RF-011-012 | Done |
| T007 | Meta `google-site-verification` em index.html | RF-011-016 | Done |
| T008 | FAQ por tool + SHARED_FAQ; FAQPage JSON-LD | RF-011-019 | Done |
| T009 | Testes unitários canonical/sitemap/registry | SC-011-001–003 | Done |
| T010 | Spec/plan/checklist; build web limpo | — | Done |
| T011 | Deploy SWA (push main) | SC-011-005 | Done |

## Ordem

T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009 → T010 → T011
