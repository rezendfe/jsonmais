# Architecture — 001-json-editor

```text
EditorPage
  └─ EditorWorkspace
        ├─ toolbar mínima (abrir/salvar por painel)
        ├─ JsonEditorPane (left)
        ├─ CenterRail (Copiar / Transformar / Diferenças)
        └─ JsonEditorPane (right)
                │
                ▼
        shared/json  (format, compact, diff, persist)
        vanilla-jsoneditor.transform()  (modal → onTransform → painel destino)
```

O trilho central é o único chrome de operações **entre** documentos. Format/compact/repair/schema/CSV permanecem nos menus nativos de cada painel.

Nenhum `POST` de documento. `ensureSession()` continua soft-fail.
