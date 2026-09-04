import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'MetalCalc — Precious Metal Value Calculator',
        short_name: 'MetalCalc',
        description: 'Live gold, silver, platinum and palladium prices with an instant purity calculator.',
        theme_color: '#16140f',
        background_color: '#f7f5f0',
        display: 'standalone',
        icons: [{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.gold-api\.com\//,
            handler: 'NetworkFirst',
            options: { cacheName: 'metal-prices', networkTimeoutSeconds: 5 },
          },
          {
            urlPattern: /^https:\/\/api\.frankfurter\.dev\//,
            handler: 'NetworkFirst',
            options: { cacheName: 'fx-rates', networkTimeoutSeconds: 5 },
          },
        ],
      },
    }),
  ],
})
