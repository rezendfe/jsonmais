# ADR-006: Identidade visual hub (referência 123tools)

## Status

Accepted — 2026-08-24

## Context

O shell atual usa barra verde sólida e tipografia genérica. O produto posiciona-se como developer toolbox JSON local-first; hubs como [123tools](https://123tools.to/) comunicam melhor “ferramentas no browser, sem cadastro”.

## Decision

Adotar padrões de *online tools hub* (hero, chips, stats, cards de ferramenta, passos, FAQ, footer categorizado) com tokens próprios (teal + Outfit/Source Sans 3). Manter `/` como editor; hub marketing em `/ferramentas`.

## Consequences

- Melhor descoberta das rotas SEO de ferramentas
- CSS modules das páginas marketing ficam mais ricos
- Não implica upload de JSON nem mudança de domínio
