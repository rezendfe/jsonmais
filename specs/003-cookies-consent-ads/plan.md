# Plan — 003-cookies-consent-ads

## Constitution Check

| Princípio | Atende? |
|-----------|---------|
| Front-only / sem App Service | Sim — só função gerenciada SWA para proxy de creative |
| JSON nunca sai do browser | Sim |
| Consentimento antes de ads | Sim |

## Abordagem

1. `shared/consent` + `shared/ads`
2. CMP + `AdBannerRow` antes do footer
3. Proxy SWA `api/GetAdCreative` + Vite proxy local
