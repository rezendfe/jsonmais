# Feature Specification: Shell footer chrome (alinhado ao header)

**Produto**: JSON Mais Portal  
**Feature Branch**: `014-shell-footer-chrome`  
**Created**: 2026-08-24  
**Status**: Done  

## Resumo executivo

Alinhar o **footer** do `AppShell` ao visual do **header**: fundo cinza/claro (ou equivalente no tema escuro), tipografia com tokens de ink/muted do chrome, sem bloco navy escuro contrastante.

## Objetivos

- Footer usa o mesmo tratamento de superfície do header (`--header-bg` / chrome compartilhado)
- Links e textos do footer usam `--ink` / `--muted` (light e dark)
- Borda superior do footer consistente com `--border`
- Sem mudança de conteúdo, rotas ou estrutura de colunas

## Não-objetivos

- Redesign de layout/colunas do footer
- i18n (`013`), CMP/ads (`003`), SEO (`011`)
- Alterar sticky/behavior do header
- Mudanças em páginas marketing além do shell

## Personas

- **Visitante**: vê shell visualmente contínuo (header ↔ conteúdo ↔ footer)
- **Usuário do editor**: footer abaixo do workspace com o mesmo cinza do topo

## Assumptions

| ID | Assunção |
|----|----------|
| A-001 | “Cinza como o header” = reutilizar `--header-bg` + tipografia do chrome (`--ink`/`--muted`), não inventar cor navy |
| A-002 | Dark mode: footer espelha o header escuro translucido já existente |
| A-003 | Tokens `--footer-*` podem ser reapontados ou removidos se deixarem de ser necessários |
| A-004 | Logo e copy do footer permanecem iguais |

---

## User Scenarios & Testing

### US1 - Footer claro no tema light (P1)

**Given** tema claro, **When** o usuário rola até o footer em qualquer rota, **Then** o fundo do footer é o mesmo cinza/branco translúcido do header (não navy `#0b1220`) e o texto é escuro/legível (`ink`/`muted`).

### US2 - Footer alinhado no tema dark (P1)

**Given** tema escuro, **When** vê o footer, **Then** o fundo acompanha o header escuro e o texto permanece legível com os tokens do tema.

### US3 - Estrutura intacta (P2)

**Given** footer atualizado, **When** inspeciona colunas (Produto / Ferramentas / Legal) e copyright, **Then** links e hierarquia permanecem os mesmos; só o chrome visual mudou.

---

## Requirements

| ID | Requisito |
|----|-----------|
| RF-014-001 | Fundo do footer = superfície do header (token compartilhado ou `--footer-bg` igual a `--header-bg`) em light e dark |
| RF-014-002 | Tipografia do footer usa `--ink` / `--muted` (ou aliases equivalentes), não tinta clara sobre navy |
| RF-014-003 | `border-top` do footer e do copyright usam `--border` |
| RF-014-004 | Sem alteração de markup de navegação/links do footer |
| RN-014-001 | Build web limpo |
| RN-014-002 | Deploy SWA via push |

## Out of Scope

- Conteúdo novo no footer; i18n; ads; mudança de logo.

## Success Criteria

- Em light, footer não é bloco escuro; visualmente par com o header.
- Em dark, footer não “pula” para navy mais escuro que o header.
- Checklist da feature OK + site publicado.
