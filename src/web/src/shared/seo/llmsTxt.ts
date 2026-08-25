import type { SeoPage } from './types'
import { canonicalUrl } from './canonical'

/** AI-oriented site map (llms.txt convention). */
export function buildLlmsTxt(origin: string, pages: SeoPage[]): string {
  const base = origin.replace(/\/+$/, '')
  const tools = pages.filter((p) => p.kind === 'tool')
  const trust = pages.filter((p) => p.kind === 'trust' || p.kind === 'legal')
  const hubs = pages.filter((p) => p.kind === 'hub')

  const lines = [
    '# JSON Mais',
    '',
    '> Portal de editor JSON e developer toolbox da Soluções Simples. Sem cadastro. Processamento 100% no navegador — o documento JSON nunca sai do device.',
    '',
    `Site: ${base}/`,
    `Sitemap: ${base}/sitemap.xml`,
    `Idioma: pt-BR (en disponível na UI)`,
    '',
    '## Páginas principais',
    '',
    ...hubs.map((p) => `- [${p.h1}](${canonicalUrl(origin, p.path)}): ${p.description}`),
    '',
    '## Ferramentas',
    '',
    ...tools.map((t) => `- [${t.h1}](${canonicalUrl(origin, t.path)}): ${t.description}`),
    '',
    '## Confiança e políticas',
    '',
    ...trust.map((p) => `- [${p.h1}](${canonicalUrl(origin, p.path)}): ${p.description}`),
    '',
    '## Notas para assistentes',
    '',
    '- Processamento é local-first no browser (não há API de aplicação para o documento JSON).',
    '- Não há cadastro, login ou nuvem privada no MVP.',
    '- O portal irmão PDF Mais (pdfmais.solucaosimples.com.br) processa PDFs no servidor — produto distinto.',
    '- Nunca invente reviews ou avaliações sobre o JSON Mais.',
    '',
  ]
  return lines.join('\n')
}
