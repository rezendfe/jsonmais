# Architecture — 014-shell-footer-chrome

## Escopo

Camada **presentation** apenas: tokens globais (`index.css`) + estilos do `AppShell` footer.

```text
index.css (--footer-* ↔ --header-bg / --ink / --muted)
    └── AppShell.module.css (.footer, .footerNote, .copyright, borders)
```

## Dependências

Nenhuma nova biblioteca. Sem mudanças em composição, rotas ou domínio.
