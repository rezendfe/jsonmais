# Architecture — 007-editor-fullbleed

```text
AppShell
  ├─ header (sticky)
  ├─ main.mainWide          ← min-height: calc(100dvh - --header-h)
  │    └─ EditorWorkspace   ← height 100%
  └─ footer                 ← abaixo do main (scroll para ver)

AppShell (outras rotas)
  ├─ header
  ├─ main.mainNarrow
  └─ footer
```
