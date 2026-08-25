# Data model — 016-theme-light-dark

## ThemePreference

| Valor | Label UI (pt-BR) |
|-------|------------------|
| `light` | Claro |
| `dark` | Escuro |

- Storage key: `jsonmais.theme.v1`
- Valores legados `system` ou desconhecidos → tratados como `light` na leitura
