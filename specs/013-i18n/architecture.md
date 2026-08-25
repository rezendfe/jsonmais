# Architecture — 013-i18n

```text
composition/
  LocaleProvider  ← React context (locale, setLocale, t)
presentation/
  AppShell        ← seletor idioma + copy
  pages/editor/toolbox ← usam useLocale().t
shared/i18n/      ← puro TS (sem React)
  locale.ts       ← detect, read/write, apply to document
  messages.ts     ← pt + en catalogs
  index.ts
```

## Resolução de locale

```text
localStorage jsonmais.locale.v1 ∈ {pt,en}?
  → use stored
else navigator.languages / language
  → first pt* → pt
  → else → en
```

## Dependências

- Presentation importa `shared/i18n` e Context
- `shared/i18n` **não** importa React nem vanilla-jsoneditor
