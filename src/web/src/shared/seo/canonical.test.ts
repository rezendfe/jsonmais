import { describe, expect, it } from 'vitest'
import {
  canonicalUrl,
  PROD_PUBLIC_ORIGIN,
  resolvePublicOrigin,
  resolveSeoIndexable,
} from './canonical'
import { getIndexableSeoPages } from './pages'
import { buildRobotsTxt, buildSitemapXml } from './sitemap'
import { SEO_TOOL_SLUGS } from './toolSlugs'

describe('canonicalUrl', () => {
  it('keeps home with trailing slash only on origin path', () => {
    expect(canonicalUrl(PROD_PUBLIC_ORIGIN, '/')).toBe(`${PROD_PUBLIC_ORIGIN}/`)
  })

  it('strips trailing slash on tool paths', () => {
    expect(canonicalUrl(PROD_PUBLIC_ORIGIN, '/ferramentas/json-formatter/')).toBe(
      `${PROD_PUBLIC_ORIGIN}/ferramentas/json-formatter`,
    )
  })
})

describe('resolveSeoIndexable', () => {
  it('indexes production origin by default', () => {
    expect(resolveSeoIndexable(undefined, PROD_PUBLIC_ORIGIN)).toBe(true)
  })

  it('disallows non-prod when flag unset', () => {
    expect(resolveSeoIndexable(undefined, 'https://green-stone.example.azurestaticapps.net')).toBe(
      false,
    )
  })

  it('respects VITE_SEO_INDEX=false', () => {
    expect(resolveSeoIndexable('false', PROD_PUBLIC_ORIGIN)).toBe(false)
  })
})

describe('robots + sitemap', () => {
  it('builds allow robots with absolute sitemap line', () => {
    const txt = buildRobotsTxt(PROD_PUBLIC_ORIGIN, true)
    expect(txt).toContain('Allow: /')
    expect(txt).toContain(`Sitemap: ${PROD_PUBLIC_ORIGIN}/sitemap.xml`)
  })

  it('builds disallow robots for staging', () => {
    expect(buildRobotsTxt(PROD_PUBLIC_ORIGIN, false)).toContain('Disallow: /')
  })

  it('sitemap lists hub, tools index, tools, trust and uses absolute URLs', () => {
    const pages = getIndexableSeoPages()
    const xml = buildSitemapXml(PROD_PUBLIC_ORIGIN, pages, '2026-08-24')
    expect(xml).toContain(`${PROD_PUBLIC_ORIGIN}/</loc>`)
    expect(xml).toContain(`${PROD_PUBLIC_ORIGIN}/ferramentas</loc>`)
    expect(xml).toContain(`${PROD_PUBLIC_ORIGIN}/ferramentas/json-formatter</loc>`)
    expect(xml).toContain(`${PROD_PUBLIC_ORIGIN}/privacidade</loc>`)
    expect(xml).toContain(`${PROD_PUBLIC_ORIGIN}/cookies</loc>`)
    expect(xml).toContain('<lastmod>2026-08-24</lastmod>')
    expect(pages.filter((p) => p.kind === 'tool').length).toBe(SEO_TOOL_SLUGS.length)
  })
})

describe('tool FAQ seo', () => {
  it('tools expose FAQ for FAQPage schema', async () => {
    const { buildJsonLd } = await import('./jsonLd')
    const pages = getIndexableSeoPages()
    const formatter = pages.find((p) => p.path === '/ferramentas/json-formatter')
    expect(formatter?.faq?.length).toBeGreaterThanOrEqual(4)
    const ld = buildJsonLd(formatter!, PROD_PUBLIC_ORIGIN, pages.filter((p) => p.kind === 'tool'))
    const raw = JSON.stringify(ld)
    expect(raw).toContain('FAQPage')
    expect(raw).toContain('BreadcrumbList')
    expect(raw).toContain('WebApplication')
  })
})

describe('resolvePublicOrigin', () => {
  it('strips trailing slashes', () => {
    expect(resolvePublicOrigin('https://jsonmais.solucaosimples.com.br/')).toBe(PROD_PUBLIC_ORIGIN)
  })
})
