import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      },
      '/projects': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      },
      '/risks': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      },
      '/geo': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      }
    }
  }
})
