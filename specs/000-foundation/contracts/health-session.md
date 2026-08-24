# Contracts — health & session

## `GET /health`

200 `{ "status": "Healthy" }`

## `GET /health/ready`

200 `{ "status": "Healthy" }` (foundation: always ready)

## `GET /api/session`

200 `{ "sessionId": "<guid>" }` + Set-Cookie `jsonmais_sid` se ausente.

## `DELETE /api/session`

204, limpa cookie e marca sessão Ended.
