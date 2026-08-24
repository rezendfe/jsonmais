import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from '../presentation/layout/AppShell'

const EditorPage = lazy(() =>
  import('../presentation/pages/EditorPage').then((m) => ({ default: m.EditorPage })),
)
const AboutPage = lazy(() =>
  import('../presentation/pages/TrustPages').then((m) => ({ default: m.AboutPage })),
)
const HowItWorksPage = lazy(() =>
  import('../presentation/pages/TrustPages').then((m) => ({ default: m.HowItWorksPage })),
)
const PrivacyPage = lazy(() =>
  import('../presentation/pages/TrustPages').then((m) => ({ default: m.PrivacyPage })),
)
const ToolsIndexPage = lazy(() =>
  import('../presentation/pages/ToolPages').then((m) => ({ default: m.ToolsIndexPage })),
)
const ToolPage = lazy(() =>
  import('../presentation/pages/ToolPages').then((m) => ({ default: m.ToolPage })),
)

function RouteFallback() {
  return null
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<EditorPage />} />
            <Route path="ferramentas" element={<ToolsIndexPage />} />
            <Route path="ferramentas/:slug" element={<ToolPage />} />
            <Route path="sobre" element={<AboutPage />} />
            <Route path="como-funciona" element={<HowItWorksPage />} />
            <Route path="privacidade" element={<PrivacyPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
