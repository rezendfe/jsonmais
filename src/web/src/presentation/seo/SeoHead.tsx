import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { applyDocumentSeo } from '../../shared/seo/applyDocumentSeo'
import {
  PROD_PUBLIC_ORIGIN,
  resolvePublicOrigin,
} from '../../shared/seo/canonical'
import { findSeoPage, NOT_FOUND_SEO } from '../../shared/seo/pages'

const origin = resolvePublicOrigin(import.meta.env.VITE_PUBLIC_ORIGIN, PROD_PUBLIC_ORIGIN)

export function SeoHead() {
  const { pathname } = useLocation()

  useEffect(() => {
    const page = findSeoPage(pathname) ?? NOT_FOUND_SEO
    applyDocumentSeo(page, origin, pathname)
  }, [pathname])

  return null
}
