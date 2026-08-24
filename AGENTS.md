# JSON Mais Portal — Constituição do Projeto

**Nome do produto:** JSON Mais (Portal Web)  
**Posicionamento:** Developer Toolbox para JSON (canivete suíço local-first)  
**Marca:** Soluções Simples (`solucoessimples.com.br`)  
**Tipo:** Portal web de edição e ferramentas JSON (processamento no browser)

Aplicação web de editor JSON e toolbox modular, inspirada no catálogo observável em [JSON Editor Online](https://jsoneditoronline.org/) e expandida para o fluxo **editar → validar → consultar → comparar → converter → gerar código**, com **SPA React estática** (100% front-end), domínio JSON no cliente (TypeScript puro), workflow SDD e deploy em hosting estático (Azure SWA).

**Irmão de produto:** o portal `Portais/PDFMais` processa arquivos no servidor (jobs efêmeros). Este portal **não possui API deployável**: parse, format, tree, table, transform, schema, compare, analyze, query, convert, codegen, sessão anônima, privacidade, CMP/ads e SEO rodam **somente no browser**. Nada do documento JSON ou do fluxo do portal exige servidor de aplicação.

## Visão Geral

| Estágio | Nome | Escopo |
|---------|------|--------|
| 0 | **Foundation** | SPA React + Vite, shell, roteamento, deploy estático |
| 1 | **Editor JSON** | Dual-panel, Text/Tree/Table, format/compact, I/O, busca, compare, repair, transform, schema |
| 2 | **Sessão & privacidade** | ID anônimo local (`localStorage`), política de não retenção de JSON |
| 12 | **Front-only** | Eliminar dependência de API; sessão e headers no cliente (`012`) |
| 3 | **Cookies & ads** | CMP, consentimento, slots de propaganda |
| 4 | **Developer Toolbox** | Analyze, Query playground, Convert, Codegen, dark mode, atalhos, rotas SEO de ferramentas |
| 5 | **Toolbox R2** | Schema generator, Patch/Merge, Flatten/Sort, Mock, SQL, Security/Mask, Go/Kotlin, TOML/Markdown (`005`) |
| 5+ | **Toolbox R3+** | JWT, API client, Share, AI — roadmap |
| 9 | **Azure deploy** | SWA estática, CI/CD build Vite (sem App Service API) |
| 10 | **Qualidade NFR** | Segurança, performance, resiliência, a11y |
| 11 | **SEO descoberta** | robots, sitemap, meta, pré-render |
| — | **Extensões** | Conta, nuvem privada, share URL, Free/Pro — **fora do MVP** |

O MVP cobre foundation + editor + toolbox R1/R2 no cliente + sessão local + deploy estático. CMP/ads (`003`), Azure/NFR/SEO e toolbox R3+ seguem no roadmap. **`src/api/` é legado** — não entra no deploy (ADR-010).

## Catálogo de utilidades

| # | Capacidade | Feature | MVP |
|---|------------|---------|-----|
| 1 | Painéis esquerdo e direito (splitter) | `001` | Sim |
| 2 | Modo texto (code) | `001` | Sim |
| 3 | Modo árvore | `001` | Sim |
| 4 | Modo tabela | `001` | Sim |
| 5 | Format / Compact | `001` | Sim |
| 6 | Abrir / salvar disco, colar, arrastar | `001` | Sim |
| 7 | Busca (e substituir quando o motor oferecer) | `001` | Sim |
| 8 | Copiar / copiar compacto L↔R | `001` | Sim |
| 9 | Compare estrutural (diff) | `001` | Sim |
| 10 | Auto-repair de JSON inválido | `001` | Sim |
| 11 | Transform (JSONPath / JMESPath / query do motor) | `001` | Sim |
| 12 | Validação JSON Schema | `001` | Sim |
| 13 | Persistência local (localStorage) | `001` | Sim |
| 14 | CSV import/export | `001` | Sim |
| 15 | Inspector + estatísticas | `004` | Sim |
| 16 | Query playground (JSONPath / JMESPath) + enviar ao editor | `004` | Sim |
| 17 | Converter YAML / XML / CSV | `004` | Sim |
| 18 | Gerar C# / TypeScript / Java / Python | `004` | Sim |
| 19 | Dark mode + atalhos de teclado | `004` | Sim |
| 20 | Rotas SEO por ferramenta | `004` | Sim |
| 21 | Schema generator + Patch/Merge + Flatten/Sort | `005` | Sim |
| 22 | Mock + SQL + Security/Mask | `005` | Sim |
| 23 | Codegen Go/Kotlin + TOML/Markdown | `005` | Sim |
| 24 | Nuvem / login / share privado / AI / JWT / API | — | Não |

## Arquitetura

Portal **100% front-end** — único artefato deployável: build estático do React. Domínio JSON e sessão anônima em TypeScript puro, isolados do React:

```text
┌─────────────────────────────────────────────────────────┐
│  React SPA (único deploy)  ← shell, editor, toolbox, CMP│
│    shared/json (domínio TS puro, sem React)             │
│    shared/session (ID anônimo local, sem React)        │
│    adapter vanilla-jsoneditor (presentation/editor)     │
│    presentation/toolbox (analyze/query/convert/codegen/R2) │
└─────────────────────────────────────────────────────────┘
         │ localStorage / sessionStorage
         ▼
   Hosting estático (Azure SWA, CDN)
   — headers via staticwebapp.config.json
```

**Regra de dependência**: `shared/json` e `shared/session` não importam React nem `vanilla-jsoneditor`. Presentation consome domínio via funções puras. **`src/api/` não faz parte do runtime** (legado da foundation; ver ADR-010).

## Stack Tecnológica

| Camada | Tecnologia | Nota |
|--------|------------|------|
| Aplicação | React + TypeScript + Vite | SPA estática; editor em tela cheia |
| Editor JSON | `vanilla-jsoneditor` | Motor alinhado ao JSON Editor Online (text/tree/table/transform/schema/repair) |
| Domínio | TypeScript em `shared/json`, `shared/session` | Testável sem DOM; sem React |
| Persistência | `localStorage` | Workspace JSON + ID anônimo local |
| Consent / ads | CMP no React (spec `003`) | não bloqueia o editor |
| Hosting | Azure Static Web Apps (ou CDN estático) | spec `009`; **sem App Service** |
| Testes | Vitest | `shared/json`, `shared/session` |

Lista canônica por feature: `specs/NNN-*/packages.md`.

## Princípios Arquiteturais

1. **Front-only** — nenhum servidor de aplicação no deploy; build Vite → arquivos estáticos.
2. **JSON no cliente** — o documento nunca sai do browser. Sem jobs, Blob ou engine JSON no servidor.
3. **Domínio isolado** — lógica em `shared/*` (TS puro); React só orquestra UI; wrappers não vazam o motor para páginas de confiança.
4. **Sem cadastro** — nenhuma conta, login ou perfil no MVP.
5. **Domain JSON puro** — parse, format, compact, diff, analyze, query, convert, codegen, schema, patch, merge, transform, security, mock, sql e persistência em TypeScript sem React.
6. **Privacidade** — não logar conteúdo JSON; localStorage só no device do usuário.
7. **Consentimento antes de ads** — cookies não essenciais só após CMP (`003`).
8. **Azure-first** — deploy SWA estática; secrets só se integração futura exigir (fora do MVP front-only).
9. **Locale MVP** — pt-BR.
10. **Pipeline entre ferramentas** — o resultado de uma operação pode alimentar o editor ou outra ferramenta sem sair do portal.

## Gates de Qualidade

- `shared/json` e `shared/session` não importam React nem vanilla-jsoneditor
- Build web e Vitest passam **sem API rodando**
- Nenhuma request de rede obrigatória no fluxo normal do portal
- Feature com `spec.md`, `plan.md` e `tasks.md` antes de código
- Nenhum secret commitado

## Estrutura de Pastas (alvo pós-implementação)

```text
JsonFormater/
├── AGENTS.md
├── .specify/memory/constitution.md
├── .cursor/rules/
├── .cursor/skills/
├── specs/
├── docs/adr/
├── src/
│   ├── web/
│   │   └── src/
│   │       ├── composition/
│   │       ├── presentation/
│   │       └── shared/
│   └── api/          ← legado (não deployável; ADR-010)
└── infra/            ← SWA / CDN
```

## Workflow SDD

1. **Constituição** → `AGENTS.md` e `.specify/memory/constitution.md`
2. **Especificação** → `specs/NNN-feature/spec.md`
3. **Plano** → `plan.md` (Constitution Check obrigatório)
4. **Design** → `architecture.md`, `data-model.md`, `research.md`, `contracts/`
5. **Tarefas** → `tasks.md`
6. **Implementação** → código seguindo tasks + `.cursor/rules/`
7. **Validação** → build/testes, checklist da feature

Ordem de leitura: `AGENTS.md` → `constitution.md` → `spec.md` → `plan.md` → design → skill de domínio → `tasks.md`.

## Skills

Catálogo: [`.cursor/skills/README.md`](.cursor/skills/README.md).

| Skill | Especialidade | Specs |
|-------|---------------|-------|
| `jsonmais-portal-sdd` | Workflow SDD | todas |
| `jsonmais-portal-foundation` | Bootstrap SPA estática | `000`, `012` |
| `jsonmais-portal-json-editor` | Dual-panel, motor JSON, I/O | `001` |
| `jsonmais-portal-developer-toolbox` | Analyze, query, convert, codegen, R2 | `004`, `005` |
| `jsonmais-portal-session-privacy` | Sessão, não retenção | `002` |
| `jsonmais-portal-cookies-ads` | CMP, ads | `003` |
| `jsonmais-portal-azure` | Bicep, CI/CD | `009` |
| `jsonmais-portal-security` | NFR segurança | `010` |
| `jsonmais-portal-performance` | NFR performance | `010` |
| `jsonmais-portal-resilience` | NFR resiliência | `010` |

Em conflito: `AGENTS.md` > `spec.md` > skill.

## Padrões de Código

- **TypeScript/React**: componentes `PascalCase`; hooks `use*`; domínio em `shared/json` e `shared/session`
- **Composition root**: `src/web/src/composition`

## Restrições (NUNCA)

- NUNCA exigir API / App Service no deploy do portal
- NUNCA fazer fetch ao backend no fluxo normal (sessão, editor, toolbox)
- NUNCA enviar o documento JSON a qualquer servidor
- NUNCA exigir cadastro/login no MVP
- NUNCA carregar scripts de ads / cookies de marketing antes do consentimento
- NUNCA logar o conteúdo JSON do usuário
- NUNCA commitar secrets
- NUNCA implementar código fora da ordem SDD quando a feature ainda não tiver `tasks.md`
- NUNCA copiar o fluxo de jobs/Blob do PDFMais para o documento JSON

## Referências

- Front-only: `specs/012-frontend-only/` (ADR-010)
- Foundation: `specs/000-foundation/` (histórico; API legada)
- Editor: `specs/001-json-editor/`
- Toolbox R1: `specs/004-developer-toolbox/`
- Toolbox R2: `specs/005-toolbox-r2/`
- Toolbox R3: `specs/009-toolbox-r3/`
- ADRs: `docs/adr/`
- Produto de referência: https://jsoneditoronline.org/
- Portal irmão (PDF, jobs): `Portais/PDFMais` — constituição distinta
