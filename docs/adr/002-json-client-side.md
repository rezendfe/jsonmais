# ADR-002: Documento JSON somente no cliente

## Status

Accepted — 2026-08-24

## Context

JSON Editor Online edita no browser. Subir JSON para jobs .NET copiaria o PDFMais sem benefício e criaria risco de retenção.

## Decision

Parse, edição, transform, schema e compare no browser. API não recebe o payload.

## Consequences

Funciona offline (soft-fail da API). Sem Blob de documento.
