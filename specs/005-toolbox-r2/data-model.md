# Data Model — 005-toolbox-r2

## JsonSchemaDocument

Heurístico Draft 2020-12: `$schema`, `type`, `properties`, `items`, `required` opcional.

## JsonPatchOp

RFC 6902: `{ op: add|remove|replace|move|copy|test, path, from?, value? }`

## MergeMode

`shallow` | `deep` | `overwrite`

## SensitiveFinding

`{ path: JSON Pointer, kind: string, sample: string }`

## SqlDialect

`sqlite` | `postgres` | `mysql` | `sqlserver`

## MockOptions

`{ count: 1..1000 }`
