# Data model — 013-i18n

| Entidade | Campos | Notas |
|----------|--------|-------|
| Locale | `'pt' \| 'en'` | Código curto |
| LocalePreference | Locale em `localStorage` | Key `jsonmais.locale.v1` |
| MessageCatalog | Record\<key, string\> | Interpolação `{name}` |

Sem PII; preferência só no device.
