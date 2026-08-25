# Feature Specification: Tema light / dark (sem system)

**Produto**: JSON Mais Portal  
**Feature Branch**: `016-theme-light-dark`  
**Created**: 2026-08-24  
**Status**: Done  

**Refina**: RF-004-008 (`004-developer-toolbox`) — remove preferência `system`.

## Resumo executivo

O seletor de tema no shell oferece apenas **Claro** e **Escuro**. Não há opção “Sistema” nem sincronização com `prefers-color-scheme` após a escolha do usuário. Preferência explícita persiste em `localStorage`.

## Objetivos

- Dropdown Tema: só `light` (Claro) e `dark` (Escuro)
- `document.documentElement.dataset.theme` = preferência escolhida
- Valores legados `system` (ou inválidos) migram para `light` na leitura
- Locale UI pt-BR no seletor (labels Claro / Escuro)

## Não-objetivos

- Modo “seguir o SO” / `prefers-color-scheme` como terceira opção
- i18n do seletor (`013`) — labels pt-BR hard-coded nesta feature
- CMP/ads, SEO, mudança de tokens CSS de dark/light

## Personas

- **Usuário**: escolhe Claro ou Escuro e a UI permanece nessa escolha entre visitas no mesmo device

## Assumptions

| ID | Assunção |
|----|----------|
| A-001 | Default na ausência de preferência válida = `light` |
| A-002 | Chave `jsonmais.theme.v1` permanece; só o domínio de valores muda |
| A-003 | Tokens CSS `html[data-theme='light'|'dark']` já existentes em `index.css` |
| A-004 | i18n (`013`) poderá traduzir labels depois sem reintroduzir `system` |

---

## User Scenarios & Testing

### US1 - Só duas opções (P1)

**Given** o header do portal, **When** o usuário abre o select Tema, **Then** vê apenas Claro e Escuro (sem Sistema).

### US2 - Persistência (P1)

**Given** o usuário escolhe Escuro, **When** recarrega a página, **Then** o tema permanece escuro e o select mostra Escuro.

### US3 - Migração de system (P1)

**Given** `localStorage` contém `jsonmais.theme.v1=system`, **When** a app carrega, **Then** aplica tema claro, persiste `light` e o select mostra Claro.

---

## Requirements

| ID | Requisito |
|----|-----------|
| RF-016-001 | `ThemePreference` = `light` \| `dark` apenas |
| RF-016-002 | Select Tema no `AppShell` lista só Claro e Escuro |
| RF-016-003 | `applyThemeToDocument` escreve `data-theme` com a preferência direta (sem `resolveTheme` / matchMedia) |
| RF-016-004 | Leitura de valor inválido ou `system` retorna `light` |
| RN-016-001 | Build web limpo |
| RN-016-002 | Deploy SWA via push em `main` |

## Out of Scope

- Traduções en; terceira opção system; temas customizados.

## Success Criteria

- Produção: select sem Sistema; Claro/Escuro funcionam e persistem.
- Checklist da feature OK + site publicado.
