import { canonicalUrl } from './canonical'
import type { SeoPage } from './types'

export function buildRobotsTxt(origin: string, indexable: boolean): string {
  if (!indexable) {
    return ['User-agent: *', 'Disallow: /', ''].join('\n')
  }
  const base = origin.replace(/\/+$/, '')
  return ['User-agent: *', 'Allow: /', '', `Sitemap: ${base}/sitemap.xml`, ''].join('\n')
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function buildSitemapXml(origin: string, pages: SeoPage[], lastmod: string): string {
  const urls = pages
    .filter((p) => !p.noindex)
    .map((page) => {
      const loc = escapeXml(canonicalUrl(origin, page.path))
      const lines = [
        '  <url>',
        `    <loc>${loc}</loc>`,
        `    <lastmod>${escapeXml(lastmod)}</lastmod>`,
      ]
      if (page.changefreq) {
        lines.push(`    <changefreq>${page.changefreq}</changefreq>`)
      }
      lines.push(`    <priority>${page.priority.toFixed(1)}</priority>`)
      lines.push('  </url>')
      return lines.join('\n')
    })

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n')
}
