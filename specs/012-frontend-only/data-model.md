# Data model — 012-frontend-only

## ClientSession

Persistido em `localStorage`.

| Campo | Tipo | Chave | Notas |
|-------|------|-------|-------|
| `clientId` | `string` (UUID) | `jsonmais_client_id` | Criado na 1ª visita; removido em “encerrar sessão” |

## Workspace (inalterado — spec `001`)

| Campo | Storage | Chave |
|-------|---------|-------|
| Painéis L/R, modo, etc. | `localStorage` | definido em `shared/json/store.ts` |

## Consent CMP (futuro — spec `003`)

| Campo | Storage | Notas |
|-------|---------|-------|
| Preferências de cookies | `localStorage` | Sem POST ao servidor no MVP |

## Não persiste

- Conteúdo JSON do editor no servidor (proibido)
- Sessão server-side / cookie `jsonmais_sid` (descontinuado)
