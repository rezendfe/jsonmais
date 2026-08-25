export type SeoPageKind = 'hub' | 'tool' | 'legal' | 'trust' | 'error'

export type SeoFaqItem = { question: string; answer: string }

export type SeoPage = {
  path: string
  title: string
  description: string
  kind: SeoPageKind
  h1: string
  priority: number
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  toolSlug?: string
  /** When true, emit noindex and exclude from sitemap */
  noindex?: boolean
  ogImagePath?: string
  faq?: SeoFaqItem[]
  /** Parent breadcrumb label after Home (optional) */
  breadcrumbParent?: { name: string; path: string }
}
