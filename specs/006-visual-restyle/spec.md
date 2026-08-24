# Feature Specification: Visual Restyle (hub 123tools)

**Produto**: JSON Mais Portal  
**Feature Branch**: `006-visual-restyle`  
**Created**: 2026-08-24  
**Status**: Done  
**Referência visual**: [123tools.to](https://123tools.to/) — padrões de hub de ferramentas online (não vídeo)

## Resumo executivo

Reestilizar o shell e as páginas de descoberta do JSON Mais no modelo de *online tools hub*: header limpo com CTA, chips de confiança, grade de ferramentas, passos “como funciona”, FAQ e footer categorizado — mantendo o editor dual-panel em `/` e o processamento 100% no browser.

## Objetivos

- Nova identidade visual (tokens CSS + tipografia) alinhada a hubs de ferramentas no browser
- Shell (header/nav/footer) no padrão marketing/tools, sem barra sólida monocromática
- `/ferramentas` como hub com hero, chips, stats, cards interativos e CTA
- `/como-funciona` com 3 passos + FAQ accordion (pt-BR)
- Páginas Sobre/Privacidade e chrome do editor herdando os mesmos tokens
- Marca JSON Mais / Soluções Simples como sinal hero nas páginas de marketing

## Não-objetivos

- Mudar rota canônica do editor (`/` permanece o workspace)
- Downloaders / processamento server-side (anti-padrão PDFMais / 123tools upload)
- CMP/ads (`003`), Azure (`009`), SEO técnico completo (`011`)
- Redesign do motor `vanilla-jsoneditor` interno (só chrome ao redor)
- Conta, pricing, multilíngue além de pt-BR

## Personas

- **Dev visitante**: entende em &lt;5s que é toolbox JSON local-first e clica no CTA
- **Usuário do editor**: chrome familiar, menos “admin green bar”, mais produto moderno
- **Agente SDD**: implementa só o que está em `tasks.md`

## Assumptions

| ID | Assunção |
|----|----------|
| A-001 | Referência = padrões de layout/IA do 123tools, não cópia de copy/marca de vídeo |
| A-002 | Fontes web via Google Fonts (Outfit + Source Sans 3) |
| A-003 | Cards só onde há interação (catálogo de ferramentas); hero sem cards flutuantes |
| A-004 | Dark mode existente permanece; tokens light/dark atualizados |
| A-005 | Locale UI: pt-BR |

---

## User Scenarios & Testing

### US1 - Hub de ferramentas parece um tools portal (P1)

**Given** usuário em `/ferramentas`, **When** carrega a página, **Then** vê hero com marca + headline + CTA, chips (ex.: sem cadastro, no browser), stats e grade de ferramentas clicáveis.

### US2 - Header com CTA e navegação clara (P1)

**Given** qualquer rota, **When** olha o header, **Then** vê logo JSON Mais, links (Editor, Ferramentas, Como funciona, Sobre), seletor de tema e CTA “Abrir editor” apontando para `/`.

### US3 - Como funciona em 3 passos + FAQ (P1)

**Given** `/como-funciona`, **When** rola a página, **Then** vê 3 passos numerados e FAQ expansível em pt-BR (privacidade local-first, sem instalação, dual-panel).

### US4 - Editor herda tokens sem regressão (P1)

**Given** `/`, **When** usa toolbar e toolbox, **Then** botões/cores usam tokens novos; dual-panel, I/O e toolbox continuam funcionando.

### US5 - Footer categorizado (P2)

**Given** qualquer página, **When** vê o footer, **Then** encontra colunas (Produto, Ferramentas, Legal) com links e nota de privacidade local-first.

---

## Requirements

### Functional

| ID | Requirement |
|----|-------------|
| RF-006-001 | Tokens CSS globais (`--brand`, superfícies, raios, sombra de card, tipografia) em `index.css` |
| RF-006-002 | `AppShell` restyled: header claro sticky, nav, CTA primário, footer multi-coluna |
| RF-006-003 | `ToolsIndexPage` com hero, chips, stats, grid de tool cards, CTA secundário ao editor |
| RF-006-004 | `HowItWorksPage` com 3 passos + FAQ accordion acessível |
| RF-006-005 | `AboutPage` / `PrivacyPage` alinhadas tipograficamente ao hub |
| RF-006-006 | Chrome do editor/toolbox usa tokens (sem hardcode `#2d7a4d` onde houver var) |
| RF-006-007 | Preview visual do produto no hero do hub (SVG/mock dual-panel), sem overlay de badges |

### Non-functional

| ID | Requirement |
|----|-------------|
| RN-006-001 | Sem regressão de rotas existentes |
| RN-006-002 | Contraste AA em texto/CTA no tema light e dark |
| RN-006-003 | Responsivo: hero e grid empilham em &lt;720px |
| RN-006-004 | Nenhum secret; sem scripts de ads |
| RN-006-005 | JSON continua só no cliente |

## Skills

`jsonmais-portal-sdd` (e foundation/editor/toolbox só para não quebrar integração)
