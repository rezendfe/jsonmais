# Feature Specification: Editor full-bleed + hub cards + footer below fold

**Produto**: JSON Mais Portal  
**Feature Branch**: `007-editor-fullbleed`  
**Created**: 2026-08-24  
**Status**: Done  
**Referência**: [123tools.to](https://123tools.to/) — grade de tool cards; workspace ocupa o 1º viewport

## Resumo

Na rota `/`, o editor dual-panel preenche a tela abaixo do header; o footer fica **abaixo da dobra** (só aparece ao rolar). Em `/ferramentas`, as ferramentas são cards no padrão de hub (ícone, categoria, título, descrição).

## Objetivos

- Editor: altura ≈ `100dvh − header`; footer não compete por espaço no 1º viewport
- Hub: cards com tile de ícone + categoria + título + descrição (grid responsivo)
- Páginas marketing mantêm footer no fluxo normal do conteúdo

## Não-objetivos

- Esconder o footer permanentemente
- Mudar motor vanilla-jsoneditor
- Landing no lugar do editor em `/`

## Requirements

| ID | Requirement |
|----|-------------|
| RF-007-001 | Em `/`, `main` do editor tem altura mínima de um viewport útil (abaixo do header sticky) |
| RF-007-002 | Em `/`, o footer só é visível após scroll vertical |
| RF-007-003 | `/ferramentas` lista tools em cards (não lista linear) com ícone/tile, categoria, título e descrição |
| RF-007-004 | Grid de cards: ≥3 colunas em desktop, 2 em tablet, 1 em mobile |
| RF-007-005 | Páginas não-editor: footer continua após o conteúdo (sem forçar height de viewport no main) |

## Skills

`jsonmais-portal-sdd`, `jsonmais-portal-json-editor` (chrome), `jsonmais-portal-developer-toolbox` (hub)
