# Plan — 006-visual-restyle

## Constitution Check

| Princípio | Status |
|-----------|--------|
| JSON só no cliente | PASS — só UI/CSS/markup |
| Domínio TS isolado | PASS — sem mudanças em `shared/json` |
| Sem cadastro | PASS — CTA abre editor anônimo |
| Locale pt-BR | PASS |
| Sem jobs/Blob de JSON | PASS |
| Tasks antes de código | PASS |

## Abordagem

1. Definir tokens (teal/ink + tipografia Outfit / Source Sans 3) espelhando hierarquia do hub 123tools.
2. Restyle `AppShell` (header claro + CTA + footer colunas).
3. Reescrever layout de `/ferramentas` e `/como-funciona` como seções marketing.
4. Propagar tokens no chrome do editor/toolbox.
5. ADR-006 registra a decisão de identidade visual.

## Fora desta feature

002/003/009/010/011; mudar `/` para landing; i18n; redesign interno do vanilla-jsoneditor.
