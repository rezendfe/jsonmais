# Feature Specification: Developer Toolbox R3

**Produto**: JSON Mais Portal  
**Feature Branch**: `009-toolbox-r3`  
**Created**: 2026-08-24  
**Status**: Done

**Input**: SRS Release 3 — JWT, HTTP client, cURL (sem Share/Projects/AI).

## Resumo

Ferramentas client-side: cliente HTTP simples (fetch) e gerador cURL. Resposta JSON pode ir ao editor.

> **Nota (2026-08-24):** decodificador JWT removido do produto — detecção de tokens permanece na aba Segurança.

## Objetivos

- Formulário HTTP: método, URL, headers, body → executar no browser
- Gerar comando cURL a partir da requisição
- Rotas SEO `/ferramentas/http-client`, `curl-generator`

## Não-objetivos

- Verificar assinatura JWT
- Share, Projects, History, AI
- Proxy server-side para contornar CORS
- Enviar documento JSON à API

## Requisitos

| ID | Requisito |
|----|-----------|
| RF-009-001 | executeHttpRequest via fetch no browser |
| RF-009-002 | generateCurl a partir de HttpRequest |
| RF-009-003 | Aba API no ToolboxPanel + pipeline |
| RF-009-004 | Rotas SEO HTTP/cURL |
