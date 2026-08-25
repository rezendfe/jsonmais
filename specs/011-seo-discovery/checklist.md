# Checklist — 011-seo-discovery

- [x] `shared/seo/` registry + sitemap + JSON-LD + llms
- [x] Plugin `seoPrerenderPlugin` no `vite build`
- [x] `robots.txt` absoluto em prod; `Disallow` em preview
- [x] `sitemap.xml` — 31 URLs absolutas + lastmod
- [x] Pré-render HTML por rota (meta + canonical + JSON-LD + H1)
- [x] `SeoHead` sincroniza head na navegação SPA
- [x] `staticwebapp.config.json` exclude + 404 noindex
- [x] `google-site-verification` meta tag
- [x] `llms.txt` + IndexNow key file
- [x] CI: `VITE_PUBLIC_ORIGIN` + `VITE_SEO_INDEX`
- [x] Testes `canonical.test.ts` passando
- [x] Build web limpo
- [ ] Pós-deploy: GSC — verificar propriedade (prefixo URL) + submeter sitemap
- [ ] Pós-deploy: Bing Webmaster — IndexNow key (opcional)

## URLs pós-deploy

| Asset | URL |
|-------|-----|
| Sitemap | https://jsonmais.solucaosimples.com.br/sitemap.xml |
| Robots | https://jsonmais.solucaosimples.com.br/robots.txt |
| llms.txt | https://jsonmais.solucaosimples.com.br/llms.txt |
