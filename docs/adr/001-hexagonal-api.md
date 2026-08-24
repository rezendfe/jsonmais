# ADR-001: Hexagonal + Clean Architecture na API de suporte

## Status

Superseded by [ADR-010](010-frontend-only.md) — 2026-08-24 (API não entra no deploy)

## Context

O portal irmão PDFMais usa Domain / Application / Infrastructure / Web. JSON Mais não processa o documento no servidor, mas mantém o mesmo modelo para health, sessão, ads futuros e Azure.

## Decision

Quatro projetos `JsonMais.*`. Nenhum endpoint de conteúdo JSON no MVP.

## Consequences

API magra; consistência de SDD e deploy com outros portais Soluções Simples.
