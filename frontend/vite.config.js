import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const backend = 'http://localhost:3000'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/register': backend,
      '/login': backend,
      '/logout': backend,
      '/api': backend,
      '^/[a-fA-F0-9]{24}$': backend,
    },
  },
})
