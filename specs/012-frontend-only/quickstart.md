# Quickstart — 012-frontend-only

## Desenvolvimento

```bash
cd src/web
npm ci
npm run dev
```

Abrir `http://localhost:5173` — **não é necessário** `dotnet run`.

## Build / deploy

```bash
cd src/web
npm run build
# Artefato: dist/ → upload SWA ou CDN
```

## Validar front-only

```bash
cd src/web
npm test
npm run build
# DevTools → Network: zero calls a /api/session ou /health
```

## Legado

`src/api/` permanece no repo como histórico da foundation; **não** faz parte do deploy.
