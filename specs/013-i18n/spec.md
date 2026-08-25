# Feature Specification: i18n (pt / en)

**Produto**: JSON Mais Portal  
**Feature Branch**: `013-i18n`  
**Created**: 2026-08-24  
**Status**: In Progress  

## Resumo executivo

Oferecer a UI do portal em **português** e **inglês**, com seletor manual no shell e **detecção automática** a partir do idioma do browser na primeira visita. Preferência explícita persiste em `localStorage`. Processamento JSON permanece 100% no cliente.

## Objetivos

- Locales suportados: `pt` (português) e `en` (inglês)
- Seletor de idioma no header (junto ao tema)
- Auto-detecção: se `navigator.languages` / `language` começa com `pt` → `pt`; caso contrário → `en`
- Preferência salva em `localStorage` sobrescreve a detecção
- Shell, páginas marketing, catálogo de ferramentas, chrome do editor/toolbox e meta `lang`/`document.title` seguem o locale ativo
- Domínio `shared/json` permanece sem React; strings de domínio de erro podem permanecer técnicas

## Não-objetivos

- Rotas prefixadas (`/en/...`) ou hreflang completo (fica em `011` SEO)
- Tradução dos menus internos do motor `vanilla-jsoneditor` (podem permanecer EN)
- Mais de dois idiomas
- Conta / sync de preferência na nuvem
- CMP/ads (`003`)

## Personas

- **Visitante BR**: browser em pt-* vê UI em português sem ação
- **Visitante internacional**: browser em en-* (ou outro) vê inglês; pode trocar para pt
- **Usuário recorrente**: escolha manual sobrevive a reloads no mesmo device

## Assumptions

| ID | Assunção |
|----|----------|
| A-001 | Sem biblioteca i18n pesada; catálogo TS + React context |
| A-002 | Chaves estáveis; valores em `pt` e `en` |
| A-003 | Rotas URL (`/ferramentas`, `/sobre`) permanecem em pt (slug estável); só o copy muda |
| A-004 | Fallback de produto sem match explícito: `en` quando o browser não é `pt*` |
| A-005 | `html[lang]` atualizado em runtime (`pt-BR` / `en`) |

---

## User Scenarios & Testing

### US1 - Detecção automática (P1)

**Given** primeira visita sem preferência salva e browser `pt-BR`, **When** carrega o portal, **Then** UI em português e `html[lang]=pt-BR`.

**Given** primeira visita e browser `en-US` (ou `de-DE`), **When** carrega, **Then** UI em inglês e `html[lang]=en`.

### US2 - Seleção manual (P1)

**Given** UI em qualquer idioma, **When** usuário escolhe Português ou English no seletor, **Then** copy atualiza imediatamente e a escolha persiste após F5.

### US3 - Shell e marketing (P1)

**Given** locale `en`, **When** navega header/footer/hub/FAQ/privacidade, **Then** labels e textos estão em inglês (marca “JSON Mais” / “Soluções Simples” inalteradas onde forem nomes próprios).

### US4 - Editor chrome (P1)

**Given** locale `en` no workspace `/`, **When** usa toolbar, trilho e compare, **Then** rótulos principais estão em inglês.

---

## Requirements

| ID | Requisito |
|----|-----------|
| RF-013-001 | Locales `pt` \| `en`; seletor no header |
| RF-013-002 | Auto-detect via `navigator.languages` / `language`; `pt*` → `pt`, senão → `en` |
| RF-013-003 | Persistência `localStorage` (`jsonmais.locale.v1`) |
| RF-013-004 | `applyLocaleToDocument`: `lang`, title e description meta básicos |
| RF-013-005 | Catálogo de mensagens cobrindo shell, trust pages, tools hub, editor chrome, toolbox labels |
| RF-013-006 | `shared/i18n` sem import React; presentation via Context |
| RN-013-001 | Vitest: detecção + read/write preference |
| RN-013-002 | Build web limpo; deploy SWA |

## Out of Scope

- Tradução de conteúdo JSON do usuário
- Localização de formatos numéricos/datas além do copy
- SEO hreflang / sitemaps bilíngues
