import type { SeoPage } from './types'
import { canonicalUrl } from './canonical'

const ORG = {
  '@type': 'Organization' as const,
  name: 'Soluções Simples',
  url: 'https://solucaosimples.com.br/',
}

function breadcrumbList(page: SeoPage, origin: string) {
  const items: object[] = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'JSON Mais',
      item: canonicalUrl(origin, '/'),
    },
  ]
  if (page.breadcrumbParent) {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: page.breadcrumbParent.name,
      item: canonicalUrl(origin, page.breadcrumbParent.path),
    })
    items.push({
      '@type': 'ListItem',
      position: 3,
      name: page.h1,
      item: canonicalUrl(origin, page.path),
    })
  } else if (page.path !== '/') {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: page.h1,
      item: canonicalUrl(origin, page.path),
    })
  }
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items,
  }
}

function faqPage(page: SeoPage, origin: string) {
  if (!page.faq?.length) return null
  return {
    '@type': 'FAQPage',
    url: canonicalUrl(origin, page.path),
    mainEntity: page.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

export function buildJsonLd(page: SeoPage, origin: string, allToolPages: SeoPage[]): object | object[] {
  const url = canonicalUrl(origin, page.path)

  if (page.kind === 'hub') {
    const itemList = {
      '@type': 'ItemList',
      itemListElement: allToolPages.map((tool, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: tool.h1,
        url: canonicalUrl(origin, tool.path),
      })),
    }
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          name: 'JSON Mais',
          url: canonicalUrl(origin, '/'),
          description: page.description,
          inLanguage: 'pt-BR',
          publisher: ORG,
        },
        ORG,
        itemList,
      ],
    }
  }

  if (page.kind === 'tool') {
    const graph: object[] = [
      {
        '@type': ['WebApplication', 'SoftwareApplication'],
        name: page.h1,
        description: page.description,
        url,
        applicationCategory: 'DeveloperApplication',
        applicationSubCategory: 'JSON Tool',
        operatingSystem: 'Web Browser',
        browserRequirements: 'Requires JavaScript',
        inLanguage: 'pt-BR',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'BRL',
        },
        provider: ORG,
      },
      breadcrumbList(page, origin),
    ]
    const faq = faqPage(page, origin)
    if (faq) graph.push(faq)
    return {
      '@context': 'https://schema.org',
      '@graph': graph,
    }
  }

  if (page.kind === 'trust' || page.kind === 'legal') {
    const graph: object[] = [
      {
        '@type': 'WebPage',
        name: page.h1,
        description: page.description,
        url,
        inLanguage: 'pt-BR',
        isPartOf: {
          '@type': 'WebSite',
          name: 'JSON Mais',
          url: canonicalUrl(origin, '/'),
        },
        publisher: ORG,
      },
      breadcrumbList(page, origin),
    ]
    const faq = faqPage(page, origin)
    if (faq) graph.push(faq)
    return {
      '@context': 'https://schema.org',
      '@graph': graph,
    }
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.h1,
    url,
  }
}
