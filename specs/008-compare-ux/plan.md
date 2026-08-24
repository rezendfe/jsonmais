# Plan — 008-compare-ux

## Constitution Check

| Princípio | Status |
|-----------|--------|
| JSON só no cliente | PASS |
| Domínio TS sem React | PASS (`diff.ts`) |
| Locale pt-BR | PASS |

## Abordagem

1. Enriquecer `DiffEntry` no domínio.
2. UI `ComparePanel` em `presentation/editor`.
3. Substituir lista crua no status bar.
