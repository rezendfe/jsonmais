# Data model — 006-visual-restyle

Sem entidades de domínio. Apenas estrutura de apresentação:

| Conceito | Campos | Notas |
|----------|--------|-------|
| TrustChip | label | Ex.: “Sem cadastro”, “No browser” |
| HubStat | value, caption | Ex.: “11+”, “ferramentas no catálogo” |
| FaqItem | question, answer | pt-BR; sem PII |
| ToolCard | slug, title, description, category | Reusa `TOOL_CATALOG` |

Persistência: nenhuma nova; tema continua em localStorage (`004`).
