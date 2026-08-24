# Research — 000-foundation

- net10.0 alinhado ao portal irmão PDFMais.
- Sessão in-memory suficiente: não há arquivos de usuário no servidor.
- Vite 8 + React 19 + react-router 7.
- Cookie `SameSite=None; Secure` em HTTPS para SPA↔API cross-origin; em HTTP local o middleware usa Secure=false se não houver HTTPS.
