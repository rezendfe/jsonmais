# Feature Specification: Sessão & privacidade

**Produto**: JSON Mais Portal  
**Feature Branch**: `002-session-privacy`  
**Created**: 2026-08-24  
**Status**: Done

## Resumo

Cookie de sessão anônima (foundation) + UX de privacidade: página `/privacidade` com encerrar sessão, limpar localStorage do workspace e política explícita de não retenção de JSON na API.

## Requirements

| ID | Requisito |
|----|-----------|
| RF-002-001 | Cliente expõe `ensureSession` e `endSession` (DELETE `/api/session`) |
| RF-002-002 | Página Privacidade: explica cookie `jsonmais_sid`, localStorage e ausência de upload de JSON |
| RF-002-003 | Ações: encerrar sessão anônima e limpar workspace local |
| RF-002-004 | Editor funciona se API/sessão falhar (soft-fail já existente) |

## Não-objetivos

- CMP / ads (spec `003`)
- Conta ou login
- Retenção de documento JSON no servidor

## Skills

`jsonmais-portal-sdd`, `jsonmais-portal-session-privacy`
