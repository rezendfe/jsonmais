# Contracts — toolbox pipeline

## Entrada

- `sourceText: string` — documento do painel esquerdo (workspace) ou textarea da ToolPage.
- Operação: analyze | query | convert | codegen.

## Saída

- `outputText: string` — JSON formatado, YAML/XML/CSV ou código.
- Ações: `copy` | `sendToRight` (workspace) | download opcional futuro.

## Erros

Mensagens pt-BR sem stack; não logar o conteúdo JSON.
