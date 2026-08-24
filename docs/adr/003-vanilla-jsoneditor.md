# ADR-003: vanilla-jsoneditor como motor visual

## Status

Accepted — 2026-08-24

## Context

O produto de referência usa svelte-jsoneditor / vanilla-jsoneditor. Reimplementar tree/table/transform/schema atrasaria o MVP.

## Decision

Adapter React em volta de `createJSONEditor`. Diff estrutural e localStorage em `shared/json` para não acoplar regras de domínio ao widget.

## Consequences

Paridade rápida de modos e menus do motor; chrome (header/footer/toolbar) é marca Soluções Simples.
