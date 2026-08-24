# Research — 006-visual-restyle

## Referência

[123tools.to](https://123tools.to/) — hub de ferramentas online:

- Hero com promessa + CTA
- Chips de confiança (free / no registration / browser-based)
- Stats (“30+ tools”, limites)
- Grade de ferramentas essenciais
- Seções “how it works” em 3 passos
- FAQ accordion
- Footer com categorias de tools
- Sem exigir conta

## Adaptação JSON Mais

| 123tools | JSON Mais |
|----------|-----------|
| Upload/processamento vídeo | Nunca — JSON só no browser |
| Home = marketing | Home = editor; hub = `/ferramentas` |
| Downloaders | Fora do escopo |
| Copy em inglês | pt-BR |

## Tipografia / cor

- Display: Outfit; corpo: Source Sans 3 (não Inter/Roboto/system default)
- Accent teal (não purple-on-white; não cream+terracotta)
- Header claro com CTA sólido; footer escuro com links

## A11y

- FAQ via `<details>`/`<summary>` (teclado nativo)
- Contraste AA em CTAs
- Foco visível no header
