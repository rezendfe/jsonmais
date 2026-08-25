# Data model — 004-developer-toolbox

## JsonStats

| Campo | Tipo | Nota |
|-------|------|------|
| objects | number | |
| arrays | number | |
| strings | number | |
| numbers | number | |
| booleans | number | |
| nulls | number | |
| maxDepth | number | |
| sizeBytes | number | UTF-8 approx do texto fonte |
| largestArrayLength | number | |

## InspectResult

| Campo | Tipo |
|-------|------|
| path | string (JSON Pointer) |
| jsonPath | string |
| type | string |
| value | unknown |

## QueryResult

| Campo | Tipo |
|-------|------|
| ok | boolean |
| value \| error | unknown \| string |

## ThemePreference

`light` | `dark` — chave localStorage `jsonmais.theme.v1` (sem `system`; ver `016`).
