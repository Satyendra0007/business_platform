import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// vite.config.js runs in Node, so process.env is available here.
// Set VITE_API_TARGET in client/.env to point at your backend.
const API_TARGET = process.env.VITE_API_TARGET || 'http://localhost:5004'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
      },
    },
  },
})
