# Architecture — 005-toolbox-r2

```text
EditorWorkspace
  ├─ left / right texts
  └─ ToolboxPanel
        ├─ Analisar / Consultar / Converter / Gerar  (004)
        ├─ Transformar → transform + patch + merge
        ├─ Schema     → schema
        ├─ Segurança  → security
        ├─ Mock       → mock
        └─ SQL        → sql
              │
              ▼
        sendToRight / copy

ToolPage (/ferramentas/:slug)
  └─ ToolboxPanel (aba fixa) + SEO
```

Nenhum endpoint recebe o documento JSON.
