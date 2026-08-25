import type { Plugin } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import {
  PROD_PUBLIC_ORIGIN,
  resolvePublicOrigin,
  resolveSeoIndexable,
  canonicalUrl,
} from '../src/shared/seo/canonical.ts'
import { buildJsonLd } from '../src/shared/seo/jsonLd.ts'
import { INDEXNOW_KEY, indexNowKeyFileName } from '../src/shared/seo/indexNow.ts'
import { buildLlmsTxt } from '../src/shared/seo/llmsTxt.ts'
import { getIndexableSeoPages, NOT_FOUND_SEO } from '../src/shared/seo/pages.ts'
import { buildRobotsTxt, buildSitemapXml } from '../src/shared/seo/sitemap.ts'
import type { SeoPage } from '../src/shared/seo/types.ts'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function injectHead(html: string, page: SeoPage, origin: string, toolPages: SeoPage[]): string {
  const url = canonicalUrl(origin, page.path)
  const imageAbs = `${origin.replace(/\/+$/, '')}${page.ogImagePath ?? '/favicon.png'}`
  const robots = page.noindex
    ? '\n    <meta name="robots" content="noindex, nofollow" />'
    : ''
  const jsonLdBlock = page.noindex
    ? ''
    : `\n    <script type="application/ld+json" id="jsonmais-jsonld">${JSON.stringify(buildJsonLd(page, origin, toolPages))}</script>`

  const headTags = `
    <title>${escapeHtml(page.title)}</title>
    <meta name="description" content="${escapeHtml(page.description)}" />
    <link rel="canonical" href="${escapeHtml(url)}" />${robots}
    <meta property="og:title" content="${escapeHtml(page.title)}" />
    <meta property="og:description" content="${escapeHtml(page.description)}" />
    <meta property="og:url" content="${escapeHtml(url)}" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="pt_BR" />
    <meta property="og:site_name" content="JSON Mais" />
    <meta property="og:image" content="${escapeHtml(imageAbs)}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${escapeHtml(page.title)}" />
    <meta name="twitter:description" content="${escapeHtml(page.description)}" />
    <meta name="twitter:image" content="${escapeHtml(imageAbs)}" />${jsonLdBlock}
`

  let out = html
  out = out.replace(/<title>[^<]*<\/title>/i, '')
  out = out.replace(/<meta\s+name="description"[^>]*>/i, '')
  out = out.replace(/<meta\s+property="og:[^"]+"[^>]*>/gi, '')
  out = out.replace(/<meta\s+name="twitter:[^"]+"[^>]*>/gi, '')
  out = out.replace(/<link\s+rel="canonical"[^>]*>/i, '')
  out = out.replace(/<\/head>/i, `${headTags}\n  </head>`)

  const faqHtml =
    page.faq && page.faq.length > 0
      ? `<section data-seo-faq><h2>Perguntas frequentes</h2>${page.faq
          .map(
            (f) =>
              `<h3>${escapeHtml(f.question)}</h3><p>${escapeHtml(f.answer)}</p>`,
          )
          .join('')}</section>`
      : ''

  const shell = `
    <div data-seo-shell>
      <h1>${escapeHtml(page.h1)}</h1>
      <p>${escapeHtml(page.description)}</p>
      <p>Sem cadastro. O JSON nunca sai do navegador.</p>
      ${faqHtml}
    </div>`

  out = out.replace(
    /<div id="root"><\/div>/i,
    `<div id="root">${shell}\n    </div>`,
  )

  return out
}

function distPathForPage(outDir: string, pagePath: string): string {
  if (pagePath === '/') return path.join(outDir, 'index.html')
  const segments = pagePath.replace(/^\//, '').split('/')
  return path.join(outDir, ...segments, 'index.html')
}

export function seoPrerenderPlugin(): Plugin {
  return {
    name: 'jsonmais-seo-prerender',
    apply: 'build',
    closeBundle() {
      const origin = resolvePublicOrigin(process.env.VITE_PUBLIC_ORIGIN, PROD_PUBLIC_ORIGIN)
      const indexable = resolveSeoIndexable(process.env.VITE_SEO_INDEX, origin)
      const pages = getIndexableSeoPages()
      const toolPages = pages.filter((p) => p.kind === 'tool')
      const lastmod = new Date().toISOString().slice(0, 10)
      const outDir = path.resolve(process.cwd(), 'dist')

      if (!fs.existsSync(outDir)) {
        console.warn('[seo] dist/ missing — skip prerender')
        return
      }

      const templatePath = path.join(outDir, 'index.html')
      if (!fs.existsSync(templatePath)) {
        console.warn('[seo] dist/index.html missing — skip prerender')
        return
      }

      const template = fs.readFileSync(templatePath, 'utf8')

      fs.writeFileSync(path.join(outDir, 'robots.txt'), buildRobotsTxt(origin, indexable), 'utf8')
      fs.writeFileSync(
        path.join(outDir, 'sitemap.xml'),
        buildSitemapXml(origin, pages, lastmod),
        'utf8',
      )
      fs.writeFileSync(path.join(outDir, 'llms.txt'), buildLlmsTxt(origin, pages), 'utf8')
      fs.writeFileSync(path.join(outDir, indexNowKeyFileName()), `${INDEXNOW_KEY}\n`, 'utf8')

      for (const page of pages) {
        const html = injectHead(template, page, origin, toolPages)
        const target = distPathForPage(outDir, page.path)
        fs.mkdirSync(path.dirname(target), { recursive: true })
        fs.writeFileSync(target, html, 'utf8')
      }

      const notFoundHtml = injectHead(template, NOT_FOUND_SEO, origin, toolPages)
      const notFoundPath = distPathForPage(outDir, '/404')
      fs.mkdirSync(path.dirname(notFoundPath), { recursive: true })
      fs.writeFileSync(notFoundPath, notFoundHtml, 'utf8')

      console.log(
        `[seo] robots.txt + sitemap.xml + llms.txt + IndexNow key + ${pages.length} prerendered pages + 404 (indexable=${indexable})`,
      )
    },
  }
}
