# Contract — client session (front-only)

Substitui `specs/000-foundation/contracts/health-session.md` para runtime de produção.

## `ensureClientSession(): ClientSessionInfo`

- Lê `localStorage['jsonmais_client_id']`
- Se ausente ou inválido, gera UUID v4, grava e retorna
- **Sem I/O de rede**
- Retorno: `{ clientId: string }`

## `endClientSession(): void`

- Remove `jsonmais_client_id` de `localStorage`
- **Sem I/O de rede**

## `maskSessionId(id: string): string`

- Primeiros 8 caracteres + `…` se length > 8

## Compatibilidade (deprecação)

| Legado | Ação |
|--------|------|
| `shared/api/session.ts` | Reexporta ou delega para `shared/session/clientSession.ts`; remover chamadas HTTP |
| Cookie `jsonmais_sid` | Ignorado; não emitido |

## Testes (Vitest)

- Cria ID na 1ª chamada
- Reutiliza ID existente
- `endClientSession` limpa storage
- Funciona com `localStorage` mockado / indisponível (graceful: ID efêmero em memória opcional)
