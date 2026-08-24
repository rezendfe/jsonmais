# Constituição (espelho Spec Kit)

Documento-espelho de [`AGENTS.md`](../../AGENTS.md). Em conflito, **AGENTS.md prevalece**.

- Produto: JSON Mais (Soluções Simples) — posicionamento Developer Toolbox
- **Portal 100% front-end** — deploy estático React/Vite; sem API obrigatória (ADR-010)
- JSON e toolbox processados **somente no browser**
- Sessão anônima: UUID em `localStorage` (`shared/session`)
- Domínio TS em `shared/json` (sem React / sem vanilla-jsoneditor)
- Pipeline: resultado de uma ferramenta pode alimentar o editor/outra ferramenta
- SDD: spec → plan → design → tasks → código
- Sem cadastro no MVP
- Locale pt-BR
- Motor visual: `vanilla-jsoneditor` (ADR-003); toolbox R1/R2 em módulos de domínio (`004`, `005`)
- `src/api/` legado — fora do deploy
