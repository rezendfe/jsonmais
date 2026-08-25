import { canonicalUrl } from './canonical'
import { buildJsonLd } from './jsonLd'
import { getIndexableSeoPages } from './pages'
import type { SeoPage } from './types'

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  const selector = `meta[${attr}="${key}"]`
  let el = document.head.querySelector(selector) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = content
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
}

function upsertJsonLd(data: object | object[]) {
  const id = 'jsonmais-jsonld'
  let el = document.getElementById(id) as HTMLScriptElement | null
  if (!el) {
    el = document.createElement('script')
    el.type = 'application/ld+json'
    el.id = id
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

function upsertRobots(noindex: boolean) {
  if (noindex) {
    upsertMeta('name', 'robots', 'noindex, nofollow')
  } else {
    document.head.querySelector('meta[name="robots"]')?.remove()
  }
}

export function applyDocumentSeo(page: SeoPage, origin: string, requestPath?: string) {
  const pathForCanonical =
    page.noindex && requestPath ? (requestPath.replace(/\/+$/, '') || '/') : page.path
  const url = canonicalUrl(origin, pathForCanonical)
  const imageAbs = `${origin.replace(/\/+$/, '')}${page.ogImagePath ?? '/favicon.png'}`

  document.title = page.title
  upsertMeta('name', 'description', page.description)
  upsertLink('canonical', url)
  upsertRobots(Boolean(page.noindex))

  upsertMeta('property', 'og:title', page.title)
  upsertMeta('property', 'og:description', page.description)
  upsertMeta('property', 'og:url', url)
  upsertMeta('property', 'og:type', 'website')
  upsertMeta('property', 'og:locale', 'pt_BR')
  upsertMeta('property', 'og:site_name', 'JSON Mais')
  upsertMeta('property', 'og:image', imageAbs)

  upsertMeta('name', 'twitter:card', 'summary')
  upsertMeta('name', 'twitter:title', page.title)
  upsertMeta('name', 'twitter:description', page.description)
  upsertMeta('name', 'twitter:image', imageAbs)

  if (!page.noindex) {
    const tools = getIndexableSeoPages().filter((p) => p.kind === 'tool')
    upsertJsonLd(buildJsonLd(page, origin, tools))
  } else {
    document.getElementById('jsonmais-jsonld')?.remove()
  }
}
