import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const backend = 'https://rep-rescue-backend.onrender.com'

export default defineConfig({
base: '/RepoRescue_/',
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
