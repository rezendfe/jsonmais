# Plan — 002-session-privacy

## Constitution Check

| Princípio | Status |
|-----------|--------|
| JSON não sobe à API | PASS |
| Sem cadastro | PASS |
| Hexagonal session já em `000` | PASS |

## Implementação

1. `shared/api/session.ts` — `endSession`
2. `shared/json/store.ts` — `clearWorkspaceFromLocalStorage`
3. `TrustPages.tsx` — painel de privacidade interativo
4. Testes Vitest para store clear
