# Plan — 005-toolbox-r2

## Constitution Check

| Princípio | Status |
|-----------|--------|
| JSON só no cliente | PASS |
| Domínio TS isolado | PASS (`shared/json/*`) |
| Sem cadastro | PASS |
| Sem Monaco (ADR-003) | PASS |
| Pipeline entre ferramentas | PASS |
| Locale pt-BR | PASS |
| Sem jobs/Blob de JSON | PASS |

## Abordagem

1. Domínio: `schema`, `patch`, `merge`, `transform`, `security`, `mock`, `sql` + extensões convert/codegen.
2. Pacote `smol-toml` para TOML (só no domínio, browser-safe).
3. UI: novas abas no `ToolboxPanel`; `rightText` para patch/merge.
4. SEO: slugs R2 em `ToolPages`.
5. ADR-005 documenta engines R2.

## Fora desta feature

002/003/009/010/011; R3 (JWT, API, Share); AI; Swift/Rust.
