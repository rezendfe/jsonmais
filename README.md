# JSON Mais — Portal Web

Editor JSON online (no browser), marca **Soluções Simples**, inspirado em [JSON Editor Online](https://jsoneditoronline.org/).

Implementação segue as `tasks.md` de cada feature. Constituição: [`AGENTS.md`](AGENTS.md).

**Arquitetura:** portal **100% front-end** — deploy estático do React/Vite, sem API obrigatória ([ADR-010](docs/adr/010-frontend-only.md)). O código em `src/api/` é legado e não entra no deploy.

## Quickstart local

```bash
cd src/web
npm install
npm run dev
```

- Editor: http://localhost:5173
- Testes: `npm test`
- Build: `npm run build` → `dist/`

## Índice de specs

| Spec | Pasta |
|------|-------|
| Foundation | [`specs/000-foundation`](specs/000-foundation/) |
| Editor JSON | [`specs/001-json-editor`](specs/001-json-editor/) |
| Front-only | [`specs/012-frontend-only`](specs/012-frontend-only/) |

Roadmap (constituição): sessão/privacidade `002`, cookies/ads `003`, Azure SWA `009`, NFR `010`, SEO `011`.

## Deploy Azure

- **Frontend:** Azure Static Web Apps via GitHub Actions ([workflow](.github/workflows/azure-static-web-apps-green-stone-0167ed410.yml))
- **URL:** https://green-stone-0167ed410.7.azurestaticapps.net/
- Guia: [`infra/azure/README.md`](infra/azure/README.md)
- Repositório remoto: https://github.com/rezendfe/jsonmais.git
