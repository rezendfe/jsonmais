# Plan — 009-toolbox-r3

## Constitution Check

| Princípio | Status |
|-----------|--------|
| JSON só no cliente | PASS |
| Domínio TS isolado | PASS |
| Sem cadastro | PASS |
| JWT decode local | PASS |
| HTTP via fetch no browser | PASS |

## Abordagem

1. `shared/json/jwt.ts`, `shared/http/request.ts`, `shared/http/curl.ts`
2. UI: abas JWT e API no ToolboxPanel
3. SEO em `toolCatalog.ts`
4. ADR-009-toolbox-r3
