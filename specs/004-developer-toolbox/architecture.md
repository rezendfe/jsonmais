# Architecture — 004-developer-toolbox

```text
EditorWorkspace
  ├─ toolbar (arquivos + tema + Ferramentas)
  ├─ dual-panel + CenterRail (001)
  └─ ToolboxPanel
        ├─ Analisar  → shared/json/analyze
        ├─ Consultar → shared/json/query
        ├─ Converter → shared/json/convert
        └─ Gerar     → shared/json/codegen
              │
              ▼
        sendToRight(text) / copy(text)

ToolPage (/ferramentas/:slug)
  └─ ToolboxPanel (tool fixa) + copy SEO
```

Nenhum endpoint recebe o documento JSON.
