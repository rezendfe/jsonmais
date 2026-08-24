# Data model — 001-json-editor

## JsonDocumentText

String UTF-8 do painel. Fonte da verdade no workspace.

## StructuralDiff

| Campo | Significado |
|-------|-------------|
| added | caminhos presentes só na direita |
| removed | caminhos presentes só na esquerda |
| changed | caminhos com valor diferente |

Objetos comparados sem ordem de chaves. Arrays comparados por índice.

## PersistedWorkspace

`{ left: string, right: string, version: 1 }` em localStorage chave `jsonmais.workspace.v1`.
