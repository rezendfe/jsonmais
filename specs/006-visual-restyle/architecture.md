# Architecture — 006-visual-restyle

```text
index.html (fonts)
    ↓
index.css  ← design tokens light/dark
    ↓
AppShell (header / main / footer)
    ├─ EditorPage (/)           ← chrome herda tokens
    ├─ ToolsIndexPage           ← hub marketing
    ├─ ToolPage                 ← hero + painel
    ├─ HowItWorksPage           ← steps + FAQ
    └─ About / Privacy          ← tipografia hub
```

Nenhuma porta C# ou domínio JSON alterados. FAQ é estado local React (details/summary nativo).
