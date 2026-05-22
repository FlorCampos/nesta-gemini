import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    host: true,   // exposes to local network (192.168.x.x) so mobile can connect
    proxy: {
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true,
        // ✅ Disable response buffering so streaming chunks pass through immediately
        // Without this, the proxy may hold the entire response before forwarding
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            // Tell any upstream cache/proxy not to buffer this response
            proxyRes.headers['x-accel-buffering'] = 'no'
            // Ensure content-type is preserved for SSE
            if (!proxyRes.headers['content-type']) {
              proxyRes.headers['content-type'] = 'text/event-stream'
            }
          })
        },
      },
    },
  },
})