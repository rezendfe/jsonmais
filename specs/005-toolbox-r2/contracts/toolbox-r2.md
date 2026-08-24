# Contract — toolbox R2 (cliente)

## Domínio (TypeScript)

```ts
generateJsonSchema(value, options?): object
diffToJsonPatch(left, right): JsonPatchOp[]
applyJsonPatch(doc, patch): unknown
mergeJson(a, b, mode): unknown
flatten(value): Record<string, unknown>
unflatten(value): unknown
sortKeys(value, dir): unknown
sortArray(value, key?, dir): unknown
scanSensitive(value): SensitiveFinding[]
maskSensitive(value, rules?): unknown
generateMock(sample, count): unknown
jsonToSql(value, { dialect, table }): string
```

## UI

- Tabs: transform | schema | security | mock | sql (+ 004)
- Props: `sourceText`, `rightText?`, `onSendToRight`
- SEO slugs: json-schema, json-patch, json-merge, flatten, security, mask, mock, json-to-sql, json-to-toml, json-to-markdown, json-to-go, json-to-kotlin
