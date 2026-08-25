import { ptMessages } from '../i18n/messages'
import { getToolFaq } from './content/toolCopy'
import { SEO_TOOL_SLUGS } from './toolSlugs'
import type { SeoPage } from './types'

const OG_IMAGE = '/favicon.png'

const EDITOR_HUB: SeoPage = {
  path: '/',
  title: 'JSON Mais — Editor JSON online grátis',
  description: ptMessages['meta.description'],
  kind: 'hub',
  h1: 'Editor JSON online',
  priority: 1,
  changefreq: 'weekly',
  ogImagePath: OG_IMAGE,
  faq: [
    {
      question: ptMessages['how.faq1.q'],
      answer: ptMessages['how.faq1.a'],
    },
    {
      question: ptMessages['how.faq2.q'],
      answer: ptMessages['how.faq2.a'],
    },
    {
      question: ptMessages['how.faq3.q'],
      answer: ptMessages['how.faq3.a'],
    },
  ],
}

const TOOLS_INDEX: SeoPage = {
  path: '/ferramentas',
  title: 'Ferramentas JSON online | JSON Mais',
  description:
    'Catálogo de ferramentas JSON: formatar, validar, JSONPath, JMESPath, schema, patch, merge, converter, gerar código e mais — tudo no navegador.',
  kind: 'hub',
  h1: 'Ferramentas JSON',
  priority: 0.9,
  changefreq: 'weekly',
  ogImagePath: OG_IMAGE,
}

const TRUST: SeoPage[] = [
  {
    path: '/sobre',
    title: 'Sobre o JSON Mais | Soluções Simples',
    description: ptMessages['about.lead'],
    kind: 'trust',
    h1: ptMessages['about.title'],
    priority: 0.5,
    changefreq: 'monthly',
    ogImagePath: OG_IMAGE,
  },
  {
    path: '/como-funciona',
    title: 'Como funciona | JSON Mais',
    description: ptMessages['how.lead'],
    kind: 'trust',
    h1: ptMessages['how.title'],
    priority: 0.6,
    changefreq: 'monthly',
    ogImagePath: OG_IMAGE,
    faq: [
      { question: ptMessages['how.faq1.q'], answer: ptMessages['how.faq1.a'] },
      { question: ptMessages['how.faq2.q'], answer: ptMessages['how.faq2.a'] },
      { question: ptMessages['how.faq3.q'], answer: ptMessages['how.faq3.a'] },
      { question: ptMessages['how.faq4.q'], answer: ptMessages['how.faq4.a'] },
      { question: ptMessages['how.faq5.q'], answer: ptMessages['how.faq5.a'] },
    ],
  },
  {
    path: '/privacidade',
    title: 'Privacidade | JSON Mais',
    description: ptMessages['privacy.lead'],
    kind: 'legal',
    h1: ptMessages['privacy.title'],
    priority: 0.4,
    changefreq: 'monthly',
    ogImagePath: OG_IMAGE,
  },
  {
    path: '/cookies',
    title: 'Cookies | JSON Mais',
    description: ptMessages['cookies.lead'],
    kind: 'legal',
    h1: ptMessages['cookies.title'],
    priority: 0.4,
    changefreq: 'monthly',
    ogImagePath: OG_IMAGE,
  },
]

export const NOT_FOUND_SEO: SeoPage = {
  path: '/404',
  title: 'Página não encontrada | JSON Mais',
  description: 'A página solicitada não existe no JSON Mais.',
  kind: 'error',
  h1: 'Página não encontrada',
  priority: 0,
  noindex: true,
  ogImagePath: OG_IMAGE,
}

function toolTitle(slug: string): string {
  return ptMessages[`tool.${slug}.title` as keyof typeof ptMessages]
}

function toolDescription(slug: string): string {
  return ptMessages[`tool.${slug}.description` as keyof typeof ptMessages]
}

function toolPages(): SeoPage[] {
  return SEO_TOOL_SLUGS.map((slug) => {
    const h1 = toolTitle(slug)
    const description = toolDescription(slug)
    return {
      path: `/ferramentas/${slug}`,
      title: `${h1} online grátis | JSON Mais`,
      description,
      kind: 'tool' as const,
      h1,
      priority: 0.8,
      changefreq: 'weekly' as const,
      toolSlug: slug,
      ogImagePath: OG_IMAGE,
      faq: getToolFaq(slug, h1, description),
      breadcrumbParent: { name: 'Ferramentas', path: '/ferramentas' },
    }
  })
}

/** All indexable pages (sitemap + prerender). */
export function getIndexableSeoPages(): SeoPage[] {
  return [EDITOR_HUB, TOOLS_INDEX, ...toolPages(), ...TRUST]
}

export function getAllSeoPages(): SeoPage[] {
  return [...getIndexableSeoPages(), NOT_FOUND_SEO]
}

export function findSeoPage(pathname: string): SeoPage | undefined {
  const normalized =
    !pathname || pathname === '/' ? '/' : pathname.replace(/\/+$/, '') || '/'
  if (normalized === '/404') return NOT_FOUND_SEO
  return getIndexableSeoPages().find((p) => p.path === normalized)
}
