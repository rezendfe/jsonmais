# Plan — 000-foundation

## Constitution Check

| Princípio | Status |
|-----------|--------|
| Hexagonal 4 projetos | PASS |
| JSON não vai à API | PASS (sem endpoints de documento) |
| Sem cadastro | PASS |
| SDD artifacts | PASS |

## Abordagem

Espelhar o bootstrap do PDFMais **sem** jobs, Blob, ads nem engine PDF. Sessão in-memory + clock. SPA Vite com AppShell e rota `/` placeholder.

## Entregáveis

API net10.0, testes Domain, web React 19 + Vite 8, quickstart no README.
