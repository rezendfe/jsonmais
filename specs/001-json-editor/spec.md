# Feature Specification: Editor JSON (paridade JSON Editor Online)

**Produto**: JSON Mais Portal  
**Feature Branch**: `001-json-editor`  
**Created**: 2026-08-24  
**Status**: Implementing

**Input**: Site funcional com as capacidades livres observáveis em https://jsoneditoronline.org/, processamento 100% no browser.

## Resumo executivo

Substituir o placeholder da `/` por um workspace dual-panel: modos texto, árvore e tabela; formatar/compactar; abrir/salvar; busca; copiar entre painéis; compare; repair; transform; schema; CSV; persistência local.

O motor visual é `vanilla-jsoneditor` (mesmo ecossistema do produto de referência). Diff estrutural e persistência ficam em `shared/json` (domínio TS).

## Objetivos

- Dois documentos independentes (esquerda / direita) com splitter
- Modos Text, Tree, Table por painel
- Format e Compact
- Abrir arquivo, salvar, colar, drag-and-drop
- Busca nativa do motor
- Copiar esquerda↔direita (formatado e compacto)
- Trilho central de ícones (Copiar, Transformar, Diferenças) entre os painéis
- Compare estrutural (adicionado / removido / alterado)
- Repair de JSON inválido (motor + jsonrepair)
- Transform (linguagens oferecidas pelo motor)
- JSON Schema no painel (quando o motor expor)
- CSV import/export quando o motor expor
- Autosave em localStorage (~último par de documentos)

## Não-objetivos

- Conta, nuvem, share URL autenticado
- Enviar JSON à API
- CMP/ads (spec `003`)
- Pixel-perfect da UI comercial do site de referência
- jq como linguagem (o produto de referência não usa jq)

## Personas

- **Desenvolvedor**: cola payload de API, formata, inspeciona árvore, compara duas versões
- **Analista**: abre JSON, usa tabela, exporta CSV

## Assumptions

| ID | Assunção |
|----|----------|
| A-001 | `vanilla-jsoneditor` cobre text/tree/table/transform/schema/repair/CSV |
| A-002 | Compare estrutural próprio em `shared/json` (não depende de conta) |
| A-003 | Documento de exemplo no primeiro load se localStorage vazio |
| A-004 | Limite prático ~2 MB por painel no localStorage |

---

## User Scenarios

### US1 - Editar e formatar (P1)

**Given** a home aberta, **When** cola JSON no painel esquerdo e formata, **Then** o texto fica indentado e o modo árvore mostra a estrutura.

### US2 - Dual panel e copiar (P1)

**Given** JSON à esquerda, **When** usa o ícone `>` do grupo Copiar no trilho central, **Then** a direita contém o mesmo documento.

### US7 - Trilho central (P1)

**Given** a home aberta, **When** vê a faixa entre os painéis, **Then** há três grupos compactos (Copiar, Transformar, Diferenças) com ícones direcionais — sem esses comandos espalhados na barra superior.

### US3 - Abrir e salvar (P1)

**Given** um arquivo `.json` no disco, **When** abre no painel e depois salva, **Then** o download reflete o conteúdo atual.

### US4 - Compare (P1)

**Given** dois documentos diferentes, **When** ativa comparar, **Then** vê contagem de adicionados/removidos/alterados.

### US5 - JSON inválido (P2)

**Given** texto com vírgula a mais, **When** usa repair, **Then** o JSON torna-se parseável ou o erro de parse é visível.

### US6 - Persistência (P2)

**Given** editou os painéis, **When** recarrega a página, **Then** o último conteúdo local é restaurado.

---

## Requirements

### Functional

| ID | Requirement |
|----|-------------|
| RF-001-001 | Dual-panel com splitter redimensionável; cada painel com Text/Tree/Table |
| RF-001-002 | Format e Compact por painel |
| RF-001-003 | Abrir (file picker + drop) e salvar `.json` por painel |
| RF-001-004 | Copiar L→R e R→L via trilho central (chevrons) |
| RF-001-005 | Busca no editor (motor) |
| RF-001-006 | Compare estrutural ignorando formatação e ordem de chaves de objeto; acionado no grupo Diferenças |
| RF-001-013 | Trilho vertical fixo entre os painéis: grupos Copiar, Transformar, Diferenças; ícones em vez de botões de texto espalhados |
| RF-001-014 | Transformar L→R / R→L abre o modal de transform do motor na origem e grava o resultado no destino |
| RF-001-007 | Repair de JSON inválido |
| RF-001-008 | Transform no motor (query/JSONPath/JMESPath conforme motor) |
| RF-001-009 | Schema validation via motor |
| RF-001-010 | Autosave localStorage das duas vias |
| RF-001-011 | CSV import/export se o motor oferecer na UI nativa |
| RF-001-012 | Soft-fail da API: editor funciona offline |

### Non-functional

| ID | Requirement |
|----|-------------|
| RN-001-001 | `shared/json` sem React |
| RN-001-002 | Motor visual lazy-load |
| RN-001-003 | Não logar conteúdo JSON |
| RN-001-004 | UI pt-BR nas barras do portal (menus nativos do motor podem permanecer EN) |

## Skills

`jsonmais-portal-sdd`, `jsonmais-portal-json-editor`
