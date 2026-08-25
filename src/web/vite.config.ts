import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const adsBase = (env.ADS_BASE_URL || '').replace(/\/$/, '')
  const adsKey = env.ADS_SISTEMA_KEY || ''
  const adsEnabled =
    env.ADS_ENABLED === '1' ||
    env.ADS_ENABLED === 'true' ||
    env.VITE_ADS_ENABLED === '1' ||
    env.VITE_ADS_ENABLED === 'true'

  return {
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/vanilla-jsoneditor')) return 'jsoneditor'
            if (id.includes('node_modules/react-router')) return 'router'
            if (id.includes('node_modules/react-dom')) return 'react-dom'
            if (id.includes('node_modules/react/')) return 'react'
          },
        },
      },
    },
    server: {
      proxy: {
        '/api/ads/creative': {
          target: adsBase || 'http://127.0.0.1:9',
          changeOrigin: true,
          secure: true,
          rewrite: () => '/v1/public/creative?format=json',
          configure(proxy) {
            proxy.on('proxyReq', (proxyReq) => {
              if (!adsEnabled || !adsKey) {
                proxyReq.destroy()
                return
              }
              proxyReq.setHeader('X-Sistema-Key', adsKey)
              proxyReq.setHeader('Accept', 'application/json')
            })
          },
        },
      },
    },
  }
})
