# Plan — 012-frontend-only

## Constitution Check

| Princípio | Antes | Depois |
|-----------|-------|--------|
| JSON no cliente | PASS | PASS (inalterado) |
| Sem cadastro | PASS | PASS |
| Privacidade / não logar JSON | PASS | PASS (melhora: zero tráfego ao servidor) |
| Hexagonal API | PASS (000) | **N/A deploy** — ADR-010 |
| SDD tasks antes de código | PASS | PASS |

**Veredito**: aprovado. Front-only reforça local-first e simplifica deploy.

## Fases

1. **Constituição** — `AGENTS.md`, `constitution.md`, ADR-010
2. **Domínio sessão** — `shared/session/clientSession.ts` + testes
3. **Integração UI** — `AppShell`, `TrustPages`; deprecar `shared/api/*`
4. **Deploy/config** — `staticwebapp.config.json`, `.env.example`, quickstart
5. **Limpeza opcional** — marcar `src/api` como legado no README

## Riscos

| Risco | Mitigação |
|-------|-----------|
| Textos antigos citam API | RF-012-005 |
| CI roda `dotnet test` | Ajustar pipeline quando existir (`009` azure) |
| Cookie `jsonmais_sid` órfão | Documentar migração; cookie expira sozinho |

## Impacto em specs anteriores

| Spec | Efeito |
|------|--------|
| `000-foundation` | Histórico; health/API não são mais requisito de prod |
| `002-session-privacy` | Comportamento observável migrado para RF-012-* |
| `003` CMP | Permanece 100% React |
| `009` azure (deploy) | Só SWA estática, sem App Service API |
| `011` SEO | Sitemap/meta no build Vite — sem API |
