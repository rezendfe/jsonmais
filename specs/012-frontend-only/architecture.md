# Architecture — 012-frontend-only

## Diagrama alvo

```text
┌─────────────────────────────────────────────────────────┐
│  Browser (React SPA — único artefato deployável)       │
│                                                         │
│  composition/     ← rotas, providers                    │
│  presentation/    ← editor, toolbox, CMP, páginas       │
│  shared/json/     ← domínio JSON (sem React)            │
│  shared/session/  ← ID anônimo local (sem React)        │
│  shared/theme/    ← dark mode                           │
└─────────────────────────────────────────────────────────┘
         │
         ▼
   localStorage / sessionStorage
   (workspace JSON, client_id, consent CMP)
         │
         ▼
   Hosting estático (Azure SWA, CDN, etc.)
   — headers via staticwebapp.config.json
```

## O que desaparece do runtime

```text
❌ JsonMais.Web /health /api/session
❌ CORS API ↔ SPA
❌ VITE_API_BASE_URL obrigatório
❌ App Service no deploy MVP
```

## Sessão local (substitui cookie de servidor)

| Aspecto | API (legado) | Front-only (alvo) |
|---------|--------------|-------------------|
| Identificador | GUID no servidor + cookie HttpOnly | UUID v4 em `localStorage` |
| Criação | Middleware na 1ª request | `ensureClientSession()` no boot |
| Encerrar | `DELETE /api/session` | `removeItem('jsonmais_client_id')` |
| Propósito | Correlação anônima futura (ads) | Mesmo — só no device |
| JSON do editor | Nunca no servidor | Nunca no servidor |

## Segurança sem API

Headers em `staticwebapp.config.json` (globalHeaders):

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: DENY`
- CSP adequada ao SPA (scripts self + inline hash se necessário para Vite)

## Pipeline de deploy

```text
npm ci && npm run build  →  dist/
                              └── upload SWA / CDN
```

Nenhum passo `dotnet publish`.
