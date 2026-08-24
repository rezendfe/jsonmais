# Quickstart — 000-foundation

> **Nota (012):** o deploy alvo é só a SPA. A API em `src/api/` é legado — não é necessária para desenvolver ou publicar o portal.

```bash
cd src/web
npm install
npm run dev
```

- Web: http://localhost:5173
- Build: `npm run build`

## Legado (opcional)

```bash
cd src/api
dotnet run --project JsonMais.Web --launch-profile https
```

Não usado pelo front-end após a spec `012-frontend-only`.
