# Feature Specification: Separadores do trilho central

**Produto**: JSON Mais Portal  
**Feature Branch**: `015-center-rail-separators`  
**Created**: 2026-08-24  
**Status**: Done  

## Resumo executivo

O trilho central (`CenterRail`) agrupa ferramentas (Copiar, API, Consultar, Converter, …) só com espaçamento e rótulos. Sem linhas entre grupos, a coluna fica confusa. Adicionar **separações singelas estilo tabela** (bordas/divisores horizontais) entre cada seção, sem mudar comportamento das ferramentas.

## Objetivos

- Cada grupo do trilho fica visualmente delimitado do seguinte (linha/borda sutil)
- Hierarquia label + controles permanece; só chrome visual
- Light e dark usam `var(--border)` (ou token equivalente)
- Sem cards pesados, sem mudança de ordem/labels/ações

## Não-objetivos

- Redesign do layout do editor ou do acordeão toolbox (`010`)
- i18n (`013`), CMP/ads (`003`), SEO (`011`)
- Novas ferramentas ou reorder do trilho
- Alterar diálogos (API / Consultar) ou ResultModal

## Personas

- **Usuário do editor**: encontra rápido qual botão pertence a qual ferramenta no trilho estreito

## Assumptions

| ID | Assunção |
|----|----------|
| A-001 | “Como tabela” = divisores horizontais entre linhas/grupos (não grid de dados) |
| A-002 | Separação via CSS em `.group` / `.rail`; markup de `<section>` já existente basta |
| A-003 | Último grupo não precisa de borda inferior (evita linha morta no fim do scroll) |
| A-004 | Tokens existentes (`--border`, `--toolbar-bg`) bastam; sem pacote novo |

---

## User Scenarios & Testing

### US1 - Grupos distintos no trilho (P1)

**Given** editor dual-panel aberto, **When** o usuário olha o trilho central, **Then** cada bloco (Copiar, API, Consultar, …) está separado do seguinte por uma linha/borda sutil, como linhas de tabela.

### US2 - Tema claro e escuro (P1)

**Given** tema light ou dark, **When** vê o trilho, **Then** os divisores usam a cor de borda do tema e permanecem legíveis sem poluir.

### US3 - Comportamento intacto (P2)

**Given** separadores aplicados, **When** usa Copiar / Converter / Comparar / Gerar / etc., **Then** ações, diálogos e resultados funcionam iguais; só o chrome visual mudou.

---

## Requirements

| ID | Requisito |
|----|-----------|
| RF-015-001 | Entre grupos consecutivos do `CenterRail` há divisor horizontal sutil (`border` / `border-bottom` com `--border`) |
| RF-015-002 | Espaçamento interno do grupo permanece legível (label + controles não colados na linha) |
| RF-015-003 | Sem alteração de markup de ações, handlers ou ordem dos grupos |
| RF-015-004 | Light e dark: divisores via tokens de tema |
| RN-015-001 | Build web limpo |
| RN-015-002 | Deploy SWA via push |

## Out of Scope

- Cards com sombra/fundo distinto por grupo; novas ferramentas; i18n de labels do trilho.

## Success Criteria

- Usuário distingue grupos sem depender só de whitespace.
- Checklist da feature OK + site publicado no SWA.
