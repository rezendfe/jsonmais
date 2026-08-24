# Deploy Azure — JSON Mais

Arquitetura alvo: **Azure Static Web Apps** (SPA estática). Sem App Service / API no deploy ([ADR-010](../../docs/adr/010-frontend-only.md)).

Repositório GitHub: [rezendfe/jsonmais](https://github.com/rezendfe/jsonmais.git)

## Static Web App (frontend)

| Item | Valor |
|------|-------|
| Recurso | `green-stone-0167ed410` |
| URL padrão | https://green-stone-0167ed410.azurestaticapps.net |
| Workflow | `.github/workflows/azure-static-web-apps-green-stone-0167ed410.yml` |
| App source | `src/web` |
| Build output | `dist` |

O secret `AZURE_STATIC_WEB_APPS_API_TOKEN_GREEN_STONE_0167ED410` é criado quando o SWA é ligado ao GitHub.

### Fluxo

1. Push na branch `main` alterando `src/web/**`
2. GitHub Actions executa build em `src/web` (Oryx / `npm run build`)
3. Artefatos de `dist/` são publicados no SWA

## API (legado)

`src/api/` e `.github/workflows/azure-api.yml` são legado da foundation — **não fazem parte do deploy**. O workflow da API só roda via `workflow_dispatch` manual, se ainda existir App Service.

## Primeiro push do código

```powershell
git add .
git commit -m "feat: portal JSON Mais front-only com deploy Azure SWA"
git branch -M main
git push -u origin main
```

O workflow do SWA dispara no push para `main` quando `src/web/**` muda.
