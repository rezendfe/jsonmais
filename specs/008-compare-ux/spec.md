# Feature Specification: Compare UX

**Produto**: JSON Mais Portal  
**Feature Branch**: `008-compare-ux`  
**Created**: 2026-08-24  
**Status**: Done

## Resumo

Tornar o compare estrutural (RF-001-006) legível: resumo com chips, lista com rótulos em pt-BR, e valores esquerda→direita nas alterações — sem enviar JSON à API.

## Requirements

| ID | Requirement |
|----|-------------|
| RF-008-001 | DiffEntry inclui valores (`left`/`right`) quando aplicável |
| RF-008-002 | Painel Compare com chips Adicionado / Removido / Alterado (+ total) |
| RF-008-003 | Filtro por tipo de diferença |
| RF-008-004 | Cada item: badge colorido, caminho, e preview de valor (antes→depois em changed) |
| RF-008-005 | Estado “iguais” e erros de parse continuam claros em pt-BR |
| RF-008-006 | Testes de domínio cobrem valores nas entradas |

## Não-objetivos

- Highlight inline no vanilla-jsoneditor
- Diff de texto linha a linha (continua estrutural)
