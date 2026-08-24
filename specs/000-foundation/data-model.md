# Data model — 000-foundation

## SessionId

Value object: `Guid` opaco, não é identidade de usuário.

## SessionRecord

| Campo | Tipo |
|-------|------|
| Id | SessionId |
| CreatedAt | DateTimeOffset |
| LastActivityAt | DateTimeOffset |
| ExpiresAt | DateTimeOffset |
| Status | Active / Ended / Expired |

TTL deslizante via `Touch`.
